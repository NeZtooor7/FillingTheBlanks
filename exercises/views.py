from django.shortcuts import render

from .forms import SentenceInputForm


def parse_sentences(raw_text: str):
    """Parse user input into renderable sentence pieces.

    Expected input:
        - Ich _ müde.
        - Du _ glücklich.

    Returns:
        tuple[list[dict], list[str]]: parsed sentences and validation errors.
    """
    sentences = []
    errors = []

    for original_line_number, line in enumerate(raw_text.splitlines(), start=1):
        stripped = line.strip()

        if not stripped:
            continue

        if not stripped.startswith('- '):
            errors.append(f'Line {original_line_number} must start with "- ".')
            continue

        sentence = stripped[2:].strip()

        if not sentence:
            errors.append(f'Line {original_line_number} is empty after "- ".')
            continue

        if '_' not in sentence:
            errors.append(f'Line {original_line_number} must contain at least one underscore "_".')
            continue

        parts = sentence.split('_')
        chunks = [
            {
                'text': part,
                'show_input_after': index < len(parts) - 1,
            }
            for index, part in enumerate(parts)
        ]

        sentences.append(
            {
                'number': len(sentences) + 1,
                'original_line_number': original_line_number,
                'chunks': chunks,
            }
        )

    if not sentences and not errors:
        errors.append('Please add at least one valid sentence.')

    return sentences, errors


def home(request):
    if request.method == 'POST':
        form = SentenceInputForm(request.POST)
        if form.is_valid():
            sentences, errors = parse_sentences(form.cleaned_data['source_text'])

            if errors:
                return render(
                    request,
                    'exercises/home.html',
                    {
                        'form': form,
                        'errors': errors,
                    },
                )

            return render(
                request,
                'exercises/exercise.html',
                {
                    'sentences': sentences,
                    'source_text': form.cleaned_data['source_text'],
                },
            )
    else:
        form = SentenceInputForm()

    return render(request, 'exercises/home.html', {'form': form})
