from django.core import signing
from django.shortcuts import redirect, render

from .forms import AIExerciseRequestForm, SentenceInputForm
from .llm_service import (
    LLMConfigurationError,
    LLMGenerationError,
    explain_wrong_answers,
    generate_ai_exercise,
)


def home(request):
    return render(
        request,
        'exercises/home.html',
        {
            'form': SentenceInputForm(),
            'ai_form': AIExerciseRequestForm(),
        },
    )


def build_sentence_chunks(source_text):
    sentences = []

    lines = [
        line.strip()
        for line in source_text.splitlines()
        if line.strip()
    ]

    for number, line in enumerate(lines, start=1):
        clean_line = line[2:] if line.startswith('- ') else line
        parts = clean_line.split('_')
        chunks = []
        blank_position = 0

        for index, part in enumerate(parts):
            show_input_after = index < len(parts) - 1

            chunk = {
                'text': part,
                'show_input_after': show_input_after,
            }

            if show_input_after:
                blank_position += 1
                chunk['blank_position'] = blank_position

            chunks.append(chunk)

        sentences.append(
            {
                'number': number,
                'chunks': chunks,
            }
        )

    return sentences


def manual_exercise_create(request):
    if request.method != 'POST':
        return redirect('exercises:home')

    form = SentenceInputForm(request.POST)

    if not form.is_valid():
        return render(
            request,
            'exercises/home.html',
            {
                'form': form,
                'ai_form': AIExerciseRequestForm(),
            },
        )

    source_text = form.cleaned_data['source_text']
    sentences = build_sentence_chunks(source_text)

    return render(
        request,
        'exercises/exercise.html',
        {
            'sentences': sentences,
            'source_text': source_text,
            'exercise_mode': 'manual',
        },
    )


def ai_exercise_create(request):
    if request.method != 'POST':
        return redirect('exercises:home')

    ai_form = AIExerciseRequestForm(request.POST)

    if not ai_form.is_valid():
        return render(
            request,
            'exercises/home.html',
            {
                'form': SentenceInputForm(),
                'ai_form': ai_form,
                'errors': ai_form.errors.values(),
            },
        )

    try:
        generated_exercise = generate_ai_exercise(ai_form.cleaned_data)
    except LLMConfigurationError as error:
        return render(
            request,
            'exercises/home.html',
            {
                'form': SentenceInputForm(),
                'ai_form': ai_form,
                'errors': [str(error)],
            },
        )
    except LLMGenerationError as error:
        return render(
            request,
            'exercises/home.html',
            {
                'form': SentenceInputForm(),
                'ai_form': ai_form,
                'errors': [
                    str(error),
                    'Please try again. The AI response did not match the expected exercise structure.',
                ],
            },
        )
    except Exception:
        return render(
            request,
            'exercises/home.html',
            {
                'form': SentenceInputForm(),
                'ai_form': ai_form,
                'errors': [
                    'The AI exercise could not be generated right now. Please check your API key, internet connection, and model name.',
                ],
            },
        )

    generated_exercise_data = generated_exercise.model_dump()
    generated_exercise_data['learning_language_code'] = ai_form.cleaned_data['learning_language']
    generated_exercise_data['spoken_language_code'] = ai_form.cleaned_data['spoken_language']

    source_text = '\n'.join(
        sentence['template']
        for sentence in generated_exercise_data['sentences']
    )

    signed_exercise_data = signing.dumps(generated_exercise_data)
    sentences = build_sentence_chunks(source_text)

    return render(
        request,
        'exercises/exercise.html',
        {
            'sentences': sentences,
            'source_text': source_text,
            'exercise_mode': 'ai',
            'signed_exercise_data': signed_exercise_data,
            'generated_exercise': generated_exercise_data,
        },
    )


def normalize_answer(value):
    return ' '.join(value.strip().casefold().split())


def answer_is_correct(user_answer, correct_answers):
    normalized_user_answer = normalize_answer(user_answer)

    return normalized_user_answer in {
        normalize_answer(correct_answer)
        for correct_answer in correct_answers
    }


def build_user_sentence(template, answers_by_position):
    clean_template = template[2:] if template.startswith('- ') else template
    parts = clean_template.split('_')
    final_sentence = ''

    for index, part in enumerate(parts):
        final_sentence += part

        position = index + 1

        if position < len(parts):
            final_sentence += answers_by_position.get(position, '')

    return final_sentence


def ai_exercise_correct(request):
    if request.method != 'POST':
        return redirect('exercises:home')

    signed_exercise_data = request.POST.get('signed_exercise_data', '')

    try:
        generated_exercise = signing.loads(
            signed_exercise_data,
            max_age=60 * 60 * 6,
        )
    except signing.BadSignature:
        return render(
            request,
            'exercises/home.html',
            {
                'form': SentenceInputForm(),
                'ai_form': AIExerciseRequestForm(),
                'errors': [
                    'The exercise data could not be verified. Please generate the exercise again.',
                ],
            },
        )

    results = []
    wrong_blanks_for_ai = []
    correct_count = 0
    total_blanks = 0

    for sentence in generated_exercise['sentences']:
        sentence_number = sentence['number']
        answers_by_position = {}
        blank_results = []

        for blank in sentence['blanks']:
            blank_position = blank['position']
            input_name = f'answer_{sentence_number}_{blank_position}'
            user_answer = request.POST.get(input_name, '').strip()
            correct_answers = blank['correct_answers']

            is_correct = answer_is_correct(user_answer, correct_answers)

            total_blanks += 1

            if is_correct:
                correct_count += 1
            else:
                wrong_blanks_for_ai.append(
                    {
                        'sentence_number': sentence_number,
                        'template': sentence['template'],
                        'full_sentence': sentence['full_sentence'],
                        'blank_position': blank_position,
                        'user_answer': user_answer,
                        'correct_answers': correct_answers,
                        'grammar_focus': blank.get('grammar_focus', ''),
                    }
                )

            answers_by_position[blank_position] = user_answer

            blank_results.append(
                {
                    'position': blank_position,
                    'user_answer': user_answer,
                    'correct_answers': correct_answers,
                    'is_correct': is_correct,
                    'grammar_focus': blank.get('grammar_focus', ''),
                    'explanation': '',
                }
            )

        results.append(
            {
                'number': sentence_number,
                'template': sentence['template'],
                'correct_sentence': sentence['full_sentence'],
                'user_sentence': build_user_sentence(
                    sentence['template'],
                    answers_by_position,
                ),
                'sentence_is_correct': all(
                    blank_result['is_correct']
                    for blank_result in blank_results
                ),
                'blanks': blank_results,
            }
        )

    explanations_by_blank = {}

    if wrong_blanks_for_ai:
        try:
            explanations_by_blank = explain_wrong_answers(
                generated_exercise=generated_exercise,
                wrong_blanks=wrong_blanks_for_ai,
            )
        except Exception:
            explanations_by_blank = {}

    for sentence_result in results:
        for blank_result in sentence_result['blanks']:
            key = (
                sentence_result['number'],
                blank_result['position'],
            )

            if key in explanations_by_blank:
                blank_result['explanation'] = explanations_by_blank[key]

    return render(
        request,
        'exercises/correction_results.html',
        {
            'results': results,
            'correct_count': correct_count,
            'total_blanks': total_blanks,
            'wrong_count': total_blanks - correct_count,
        },
    )