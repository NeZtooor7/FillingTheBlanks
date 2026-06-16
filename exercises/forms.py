import re

from django import forms


LINE_PATTERN = re.compile(r"^- .+_.+$")


class SentenceInputForm(forms.Form):
    source_text = forms.CharField(
        widget=forms.Textarea(
            attrs={
                'rows': 12,
                'placeholder': '- Ich _ müde.\n- Du _ glücklich.\n- Er _ zu Hause.',
                'class': 'sentence-textarea',
            }
        ),
    )

    def clean_source_text(self):
        source_text = self.cleaned_data['source_text']
        lines = [line.strip() for line in source_text.splitlines() if line.strip()]

        if not lines:
            raise forms.ValidationError('Please write at least one sentence.')

        errors = []

        for index, line in enumerate(lines, start=1):
            if not line.startswith('- '):
                errors.append(f'Line {index}: must start with "- ".')
                continue

            if '_' not in line:
                errors.append(f'Line {index}: must contain at least one underscore "_".')
                continue

            if not LINE_PATTERN.match(line):
                errors.append(
                    f'Line {index}: must contain text before and after the underscore.'
                )

        if errors:
            raise forms.ValidationError(errors)

        return '\n'.join(lines)