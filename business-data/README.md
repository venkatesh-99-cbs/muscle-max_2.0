# Business data

This is the source data the chatbot's knowledge base is built from
(`backend/apps/chatbot/rag/ingest.py` reads these files).

**Status: TEMPLATE.** The category names and general usage/precaution
language below reflect standard supplement-industry labeling practice,
but every price, exact ingredient list, and dosage number is a
placeholder (`"TBD"`). Before this goes live:

1. Replace every `"TBD"` field with your actual verified data (real
   prices, real ingredient/nutrition panels, lab-checked serving sizes).
2. Have the age-limit and precaution text reviewed against your actual
   product labels and any regulations that apply where you sell (these
   are safety-relevant claims — don't publish them unverified).
3. Re-run `python manage.py ingest_knowledge_base` after editing.

Don't let the chatbot answer real customers from unverified numbers —
the whole point of the "I don't know" fallback is that a wrong-but-
confident answer is worse than none.
