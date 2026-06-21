from pydantic import BaseModel, Field


class GeneratedBlank(BaseModel):
    position: int = Field(ge=1)
    correct_answers: list[str] = Field(min_length=1)
    grammar_focus: str


class GeneratedSentence(BaseModel):
    number: int = Field(ge=1)
    template: str
    full_sentence: str
    blanks: list[GeneratedBlank] = Field(min_length=1)


class GeneratedExerciseResponse(BaseModel):
    exercise_title: str
    language: str
    level: str
    instructions: str
    sentences: list[GeneratedSentence] = Field(min_length=1)


class WrongBlankExplanation(BaseModel):
    sentence_number: int = Field(ge=1)
    blank_position: int = Field(ge=1)
    explanation: str


class CorrectionExplanationResponse(BaseModel):
    explanations: list[WrongBlankExplanation]