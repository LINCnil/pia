# PIA import / export JSON format

When a PIA is exported (or duplicated) the tool produces a single JSON document. The same document is accepted by the **Import** feature. This page describes its structure.

## General structure

```json
{
  "pia": {},
  "answers": [],
  "measures": [],
  "evaluations": [],
  "comments": []
}
```

| Key           | Type   | Description                                                           |
| ------------- | ------ | --------------------------------------------------------------------- |
| `pia`         | object | PIA metadata (name, status, people, DPO / data subjects opinions).    |
| `answers`     | array  | Answers to the questions of sections 1, 2 and 3.                      |
| `measures`    | array  | Measures declared in section 3.1 ("Planned or existing measures").    |
| `evaluations` | array  | Evaluation of each item (status, comments, risk gauges, action plan). |
| `comments`    | array  | Reviewer comments attached to a question or a measure.                |

`pia` is mandatory (import fails with `wrong pia file` if missing). The four other keys must be arrays (use `[]` when empty). IDs (`id`, `pia_id`) are regenerated on import; relations between objects are made through `reference_to`.

Dates are ISO 8601 strings (e.g. `2018-02-20T15:25:41.845Z`).

## `pia` object

| Field                               | Type    | Description                                                                         |
| ----------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `id`                                | number  | Internal PIA identifier. Regenerated on import.                                     |
| `name`                              | string  | PIA name. On import the name is prefixed, e.g. `(IMPORT) name`.                     |
| `category`                          | string  | Free category label.                                                                |
| `status`                            | number  | `0` doing, `1` refused, `2` simple validation, `3` signed validation, `4` archived. |
| `progress`                          | number  | Completion percentage (0–100). Recomputed on import.                                |
| `is_example`                        | number  | `1` if the PIA is the built-in example, else `0`. Ignored on import.                |
| `is_archive`                        | number  | `1` if archived, else `0`.                                                          |
| `created_at` / `updated_at`         | string  | Creation / last update dates.                                                       |
| `author_name`                       | string  | Name of the author.                                                                 |
| `evaluator_name`                    | string  | Name of the evaluator.                                                              |
| `validator_name`                    | string  | Name of the validator.                                                              |
| `dpos_names`                        | string  | Name(s) of the DPO (Data Protection Officer).                                       |
| `dpo_status`                        | number  | DPO opinion: `0` not OK, `1` OK. `null` if not set.                                 |
| `dpo_opinion`                       | string  | DPO opinion text (may contain HTML).                                                |
| `people_names`                      | string  | Name(s) of the data subjects (or representatives) consulted.                        |
| `concerned_people_searched_opinion` | boolean | Whether the opinion of data subjects was sought.                                    |
| `concerned_people_searched_content` | string  | Justification when the opinion was not sought.                                      |
| `concerned_people_status`           | number  | Data subjects opinion: `0` not OK, `1` OK. `null` if not set.                       |
| `concerned_people_opinion`          | string  | Data subjects opinion text (may contain HTML).                                      |
| `rejection_reason`                  | string  | Reason given when the PIA is refused (`status = 1`).                                |
| `applied_adjustments`               | string  | Adjustments applied after validation.                                               |

Optional fields:

| Field                                                     | Type            | Description                                                                                         |
| --------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `structure_id`, `structure_name`, `structure_sector_name` | number / string | Custom PIA model (structure) used for this PIA.                                                     |
| `structure_data`                                          | object          | `{ "sections": [...] }` – the custom model itself (same layout as `pia_architecture.json`).         |
| `user_pias`                                               | array           | Server mode only: `[{ "user": {...}, "role": "author" \| "evaluator" \| "validator" \| "guest" }]`. |

## `answers[]`

One entry per answered question.

| Field                       | Type   | Description                                                                                            |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `id`                        | number | Answer ID.                                                                                             |
| `pia_id`                    | number | Parent PIA.                                                                                            |
| `reference_to`              | number | ID of the question answered, `<section><item><question>` (e.g. `121` = section 1, item 2, question 1). |
| `data`                      | object | Answer content, see below.                                                                             |
| `created_at` / `updated_at` | string | Dates.                                                                                                 |

`data` always contains three keys; only the one relevant to the question type is filled, the others are `null` / empty:

| Key     | Type           | Used by                                                                                               |
| ------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `text`  | string \| null | Free-text questions (HTML). Sections 1 and 2.                                                         |
| `list`  | string[]       | Tag list questions: impacts, threats, sources, controls (section 3).                                  |
| `gauge` | number \| null | Severity / likelihood questions (section 3): `1` negligible, `2` limited, `3` important, `4` maximum. |

### Question reference IDs

Defined in `src/assets/files/pia_architecture.json`:

| Section                  | Items → questions                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 Context                | 1 Overview (`111`–`113`); 2 Data, processes and supporting assets (`121`–`123`)                                                                                                                                                                              |
| 2 Fundamental principles | 1 Proportionality and necessity (`211`–`215`); 2 Controls to protect data subjects' rights (`221`–`227`)                                                                                                                                                     |
| 3 Risks                  | 2 Illegitimate access to data (`321`–`326`); 3 Unwanted modification of data (`331`–`336`); 4 Data disappearance (`341`–`346`). Within each: `x21` impacts, `x22` threats, `x23` sources, `x24` controls (lists), `x25` severity, `x26` likelihood (gauges). |

Section 3 items 1 (measures) and 5 (overview), and section 4 (validation) have no `answers`.

## `measures[]`

Measures of section 3.1.

| Field                       | Type   | Description                                                                                                                                                                                    |
| --------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                        | number | Measure ID. Referenced by evaluations (`3.1.<id>`) and comments. Evaluation references are remapped on import.                                                                                 |
| `pia_id`                    | number | Parent PIA.                                                                                                                                                                                    |
| `title`                     | string | Measure title.                                                                                                                                                                                 |
| `content`                   | string | Measure description.                                                                                                                                                                           |
| `placeholder`               | string | Translation key of the placeholder shown in the field: `knowledge_base.slugs.<SLUG>.placeholder` for measures created from the knowledge base, `measures.default_placeholder` for custom ones. |
| `created_at` / `updated_at` | string | Dates.                                                                                                                                                                                         |

## `evaluations[]`

One entry per evaluated item.

| Field                           | Type   | Description                                                                                                                                                                     |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                            | number | Evaluation ID.                                                                                                                                                                  |
| `pia_id`                        | number | Parent PIA.                                                                                                                                                                     |
| `reference_to`                  | string | Evaluated item: `1.1`, `1.2`, `3.2`, `3.3`, `3.4` (context and risk items), `2.<item>.<question>` for fundamental principles (e.g. `2.1.211`), `3.1.<measure id>` for measures. |
| `status`                        | number | `0` pending, `1` to be fixed, `2` improvable, `3` acceptable.                                                                                                                   |
| `global_status`                 | number | `0` no evaluation, `1` evaluation started, `2` evaluation completed.                                                                                                            |
| `evaluation_comment`            | string | Evaluator's comment (HTML). Optional.                                                                                                                                           |
| `action_plan_comment`           | string | Corrective action to apply (HTML). Optional.                                                                                                                                    |
| `person_in_charge`              | string | Person responsible for the action plan. Optional.                                                                                                                               |
| `estimated_implementation_date` | string | Planned implementation date. Optional.                                                                                                                                          |
| `evaluation_date`               | string | Date of the evaluation. Optional.                                                                                                                                               |
| `gauges`                        | object | `{ "x": number, "y": number }`. Meaningful for risk items (`3.2`–`3.4`): `x` = severity, `y` = likelihood, `1`–`4` (same scale as above); `0` otherwise.                        |
| `created_at` / `updated_at`     | string | Dates.                                                                                                                                                                          |

## `comments[]`

| Field                       | Type    | Description                                                                                       |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| `id`                        | number  | Comment ID.                                                                                       |
| `pia_id`                    | number  | Parent PIA.                                                                                       |
| `description`               | string  | Comment text.                                                                                     |
| `reference_to`              | number  | Target of the comment: a question ID (e.g. `212`) or, if `for_measure` is `true`, a measure `id`. |
| `for_measure`               | boolean | `true` if the comment is attached to a measure.                                                   |
| `created_at` / `updated_at` | string  | Dates.                                                                                            |

## Notes for external use

- Text fields may contain HTML.
- Section/question titles are **not** exported: they are translation keys in `src/assets/i18n/*.json`, and the structure is in `src/assets/files/pia_architecture.json`. Answer content is in the language the user typed.
- Duplicating a PIA uses the same format but resets statuses, opinions and comments.
