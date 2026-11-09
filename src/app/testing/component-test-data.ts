import { Answer } from '../models/answer.model';
import { Evaluation } from '../models/evaluation.model';
import { KnowledgeBase } from '../models/knowledgeBase.model';
import { Measure } from '../models/measure.model';
import { Pia } from '../models/pia.model';
import { Revision } from '../models/revision.model';
import { Structure } from '../models/structure.model';
import architecture from 'src/assets/files/pia_architecture.json';

export function createComponentTestData() {
  const data: { sections: any[] } = JSON.parse(JSON.stringify(architecture));
  const section = data.sections[0];
  const item = section.items[0];
  const question = item.questions[0];
  const pia = Object.assign(new Pia(), {
    id: 1,
    name: 'Test assessment',
    category: 'Test',
    progress: 0,
    user_pias: [],
    authors: [],
    evaluators: [],
    validators: [],
    guests: [],
  });
  const structure = Object.assign(new Structure(), {
    id: 1,
    name: 'Test structure',
    sector_name: 'Test',
    data,
  });
  const answer = Object.assign(new Answer(), {
    id: 1,
    pia_id: pia.id,
    reference_to: question.id,
    data: { text: 'Test answer', gauge: null, list: [] },
  });
  const measure = Object.assign(new Measure(), {
    id: 1,
    pia_id: pia.id,
    title: 'Test measure',
    content: 'Test content',
  });
  const evaluation = Object.assign(new Evaluation(), {
    id: 1,
    pia_id: pia.id,
    reference_to: '1.1',
  });
  const base = new KnowledgeBase(1, 'Test knowledge base', 'Author', '');
  const revision = Object.assign(new Revision(), {
    id: 1,
    pia_id: pia.id,
    created_at: new Date(),
    export: JSON.stringify({ pia, answers: [], measures: [], evaluations: [] }),
  });

  return {
    data,
    section,
    item,
    question,
    pia,
    structure,
    answer,
    measure,
    evaluation,
    base,
    revision,
    comment: { id: 1, description: 'Test comment', created_at: new Date() },
    itemKb: {
      name: 'Test knowledge',
      description: 'Test description',
      category: 'Test category',
      filters: 'measure.definition',
      slug: 'test-knowledge',
    },
    attachment: { id: 1, name: 'Test attachment', file: '' },
  };
}

export type ComponentTestData = ReturnType<typeof createComponentTestData>;
