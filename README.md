# Filling the Blanks

A small Django web app for creating fill-in-the-blank exercises from plain text.

The app runs locally and converts sentences containing underscores (`_`) into interactive text inputs. After the user fills in all the blanks, the completed numbered sentences can be copied to the clipboard with one click.

This project can be especially useful for language learning. You can generate complete fill-in-the-blank exercises with an AI tool such as ChatGPT, Google AI, or another assistant, paste the generated sentences into the app, and practice reading, writing, grammar, vocabulary, or verb conjugation in a new language.

## Features

* Generate fill-in-the-blank exercises from plain text
* Support for multiple sentences
* Support for multiple blanks in the same sentence
* Automatic numbered output
* Copy completed answers to clipboard
* Dark mode
* Multilingual interface
* Flag-based language selector
* Input validation for the required sentence format
* Local Apache + Waitress support on Windows

## Example

### Input

```text
- Ich _ müde.
- Du _ glücklich.
- Er _ zu Hause.
```

### Exercise

The app turns each underscore into a text input.

For example:

```text
1. Ich [____] müde.
2. Du [____] glücklich.
3. Er [____] zu Hause.
```

### Clipboard output

After filling the blanks with `bin`, `bist`, and `ist`, the **Copy to clipboard** button produces:

```text
1. Ich bin müde.
2. Du bist glücklich.
3. Er ist zu Hause.
```

## Input Format

Each line must:

1. Start with `- `
2. Contain at least one underscore `_`
3. Have text before and after the blank

Valid example:

```text
- Ich _ müde.
- Heute _ ich Deutsch.
- Wir _ in Berlin.
```

Invalid examples:

```text
Ich _ müde.
- Ich bin müde.
- _
```

## Tech Stack

* Python
* Django
* HTML
* CSS
* JavaScript
* Waitress
* Apache HTTP Server

## Requirements

* Python 3.10+
* Django 5.x
* Waitress
* WhiteNoise

## Local Development Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it.

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

### Windows CMD

```cmd
.venv\Scripts\activate.bat
```

### macOS/Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the development server:

```bash
python manage.py runserver
```

Open the app in your browser:

```text
http://127.0.0.1:8000/FillingTheBlanks/
```

## Running with Waitress

For a local production-like setup on Windows, run:

```powershell
.venv\Scripts\waitress-serve.exe --listen=127.0.0.1:8001 fillblanker.wsgi:application
```

Then open:

```text
http://127.0.0.1:8001/FillingTheBlanks/
```

## Running with Apache on Windows

This project can also be served locally through Apache using a reverse proxy.

Expected final URL:

```text
http://localhost/FillingTheBlanks/
```

The general flow is:

```text
Browser → Apache → Waitress → Django
```

Apache serves the public `/FillingTheBlanks/` URL and forwards the request to Waitress running on:

```text
http://127.0.0.1:8001/FillingTheBlanks/
```

Static files can be served through Apache using Django’s `collectstatic` output.

Run:

```bash
python manage.py collectstatic
```

Then configure Apache to serve the `staticfiles` directory through `/static/`.

## Project Structure

```text
FillingTheBlanks/
├── exercises/
│   ├── static/
│   │   └── exercises/
│   │       ├── flags/
│   │       ├── styles.css
│   │       ├── theme.js
│   │       ├── i18n.js
│   │       └── clipboard.js
│   ├── templates/
│   │   └── exercises/
│   │       ├── base.html
│   │       ├── home.html
│   │       └── exercise.html
│   ├── forms.py
│   ├── urls.py
│   └── views.py
├── fillblanker/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── requirements.txt
└── README.md
```

## Multilingual Interface

The interface supports multiple languages using a lightweight JavaScript translation file.

Supported languages:

* Spanish
* English
* German
* Japanese
* Hindi
* Romanian
* Italian
* Portuguese

The app does not translate the user’s sentences. It only translates interface texts such as labels, buttons, help messages, and page titles.

## Notes

* This is a local-first project.
* It does not require a database for the core functionality.
* The clipboard feature uses browser JavaScript.
* The app is useful for language learning exercises, especially grammar drills and verb conjugation practice.

## Possible Future Improvements

* Export exercises as PDF
* Save exercise templates
* Add answer checking
* Add support for hints
* Add keyboard shortcuts
* Add user-created exercise collections
* Add Docker support

## License

This project is intended for educational and portfolio purposes.
