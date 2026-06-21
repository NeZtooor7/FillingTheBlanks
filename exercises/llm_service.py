import json

from django.conf import settings
from openai import OpenAI

from .llm_schemas import CorrectionExplanationResponse, GeneratedExerciseResponse


LANGUAGE_NAMES = {
    'es': 'Spanish',
    'en': 'English',
    'de': 'German',
    'ja': 'Japanese',
    'hi': 'Hindi',
    'ro': 'Romanian',
    'it': 'Italian',
    'pt': 'Portuguese',
}


def get_language_name(language_code):
    return LANGUAGE_NAMES.get(language_code, 'English')


class LLMConfigurationError(Exception):
    pass


class LLMGenerationError(Exception):
    pass


def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise LLMConfigurationError(
            'OPENAI_API_KEY is missing. Add it to your .env file.'
        )

    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
    )


def split_comma_values(raw_value):
    if not raw_value:
        return []

    return [
        item.strip()
        for item in raw_value.split(',')
        if item.strip()
    ]


def build_ai_generation_request(cleaned_data):
    learning_language = get_language_name(cleaned_data['learning_language'])
    spoken_language = get_language_name(cleaned_data['spoken_language'])

    return {
        'learning_language': learning_language,
        'spoken_language': spoken_language,
        'level': cleaned_data['level'],
        'sentence_count': cleaned_data['sentence_count'],
        'blanks_per_sentence': cleaned_data['blank_count'],
        'focus': cleaned_data.get('focus') or [],
        'user_goal': cleaned_data['ai_goal'],
        'allowed_verbs': split_comma_values(cleaned_data.get('verbs')),
        'allowed_subjects': split_comma_values(cleaned_data.get('subjects')),
        'tense': cleaned_data.get('tense') or 'auto',
        'topic': cleaned_data.get('topic') or '',
        'allowed_expressions': split_comma_values(cleaned_data.get('expressions')),
    }


def validate_generated_exercise(exercise, expected_sentence_count):
    if len(exercise.sentences) != expected_sentence_count:
        raise LLMGenerationError(
            f'The AI generated {len(exercise.sentences)} sentences, but {expected_sentence_count} were requested.'
        )

    for sentence in exercise.sentences:
        if not sentence.template.startswith('- '):
            raise LLMGenerationError(
                f'Sentence {sentence.number} must start with "- ".'
            )

        underscore_count = sentence.template.count('_')

        if underscore_count == 0:
            raise LLMGenerationError(
                f'Sentence {sentence.number} does not contain any "_".'
            )

        if underscore_count != len(sentence.blanks):
            raise LLMGenerationError(
                f'Sentence {sentence.number} has {underscore_count} blanks, '
                f'but {len(sentence.blanks)} blank objects.'
            )

        if '_' in sentence.full_sentence:
            raise LLMGenerationError(
                f'Sentence {sentence.number} full_sentence still contains "_".'
            )


def generate_ai_exercise(cleaned_data):
    request_payload = build_ai_generation_request(cleaned_data)
    client = get_openai_client()
    learning_language = request_payload['learning_language']

    system_prompt = f"""
You generate {learning_language} fill-in-the-blank language exercises.

Rules:
- The exercise language must be {learning_language}.
- Each sentence template must start with "- ".
- Each blank must be represented by exactly one underscore "_".
- The number of underscores in template must match the number of objects in blanks.
- full_sentence must contain the completed sentence without "- " and without "_".
- correct_answers must be a list, even when there is only one correct answer.
- Keep the level appropriate for the requested CEFR level.
- Avoid unsafe, offensive, sexual, violent, or discriminatory content.
- Do not include markdown.
- Return only the structured response requested by the application.
"""

    user_prompt = f"""
Create a fill-in-the-blank German exercise using this request:

{json.dumps(request_payload, ensure_ascii=False, indent=2)}
"""

    response = client.responses.parse(
        model=settings.OPENAI_GENERATION_MODEL,
        input=[
            {
                'role': 'system',
                'content': system_prompt,
            },
            {
                'role': 'user',
                'content': user_prompt,
            },
        ],
        text_format=GeneratedExerciseResponse,
    )

    exercise = response.output_parsed

    validate_generated_exercise(
        exercise=exercise,
        expected_sentence_count=request_payload['sentence_count'],
    )

    return exercise


def explain_wrong_answers(generated_exercise, wrong_blanks):
    if not wrong_blanks:
        return {}

    spoken_language_code = generated_exercise.get('spoken_language_code', 'en')
    learning_language = generated_exercise.get('language', 'German')
    spoken_language = get_language_name(spoken_language_code)
    client = get_openai_client()

    payload = {
        'language': learning_language,
        'level': generated_exercise.get('level', 'A1'),
        'wrong_blanks': wrong_blanks,
    }

    system_prompt = f"""
You explain mistakes in {learning_language} fill-in-the-blank exercises.

Rules:
- Your explanation of the mistakes must be in {spoken_language}.
- Only explain the wrong blanks provided.
- Do not change the official correct_answers.
- Keep explanations short, friendly, and useful.
- Explain why the user's answer is wrong according to the provided correct_answers.
- Do not include markdown.
- Return only the structured response requested by the application.
"""

    user_prompt = f"""
Explain these wrong answers:

{json.dumps(payload, ensure_ascii=False, indent=2)}
"""

    response = client.responses.parse(
        model=settings.OPENAI_CORRECTION_MODEL,
        input=[
            {
                'role': 'system',
                'content': system_prompt,
            },
            {
                'role': 'user',
                'content': user_prompt,
            },
        ],
        text_format=CorrectionExplanationResponse,
    )

    parsed = response.output_parsed

    return {
        (item.sentence_number, item.blank_position): item.explanation
        for item in parsed.explanations
    }