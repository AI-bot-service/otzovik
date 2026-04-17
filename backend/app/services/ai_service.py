import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

ANALYSIS_SYSTEM = """Ты аналитик отзывов. Получаешь сниппеты текста со страницы сайта с отзывами об объекте.
Анализируй и возвращай JSON со следующей структурой:
{
  "description": "краткое описание сайта (1-2 предложения)",
  "positive_count": число,
  "negative_count": число,
  "neutral_count": число,
  "activity_score": число 0-100 (насколько живо обсуждение),
  "summary": "краткий вывод об обсуждении объекта на этом сайте"
}
Отвечай только валидным JSON, без markdown-обёртки."""


async def analyze_reviews(query_text: str, site_domain: str, snippets: list[str]) -> dict:
    content = f"Объект поиска: {query_text}\nСайт: {site_domain}\n\nФрагменты:\n"
    content += "\n---\n".join(snippets[:10])

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1024,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM},
            {"role": "user", "content": content},
        ],
        response_format={"type": "json_object"},
    )

    try:
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {
            "description": "",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
            "activity_score": 0,
            "summary": "",
        }
