import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ActionPlanService } from '../services/action-plan.service';
import { AnswerService } from '../services/answer.service';
import { AnswerStructureService } from '../services/answer-structure.service';
import { ApiService } from '../services/api.service';
import { AppDataService } from '../services/app-data.service';
import { ArchiveService } from '../services/archive.service';
import { AttachmentsService } from '../services/attachments.service';
import { AuthService } from '../services/auth.service';
import { CommentsService } from '../services/comments.service';
import { DialogService } from '../services/dialog.service';
import { EvaluationService } from '../services/evaluation.service';
import { GlobalEvaluationService } from '../services/global-evaluation.service';
import { IntrojsService } from '../services/introjs.service';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { KnowledgesService } from '../services/knowledges.service';
import { LanguagesService } from '../services/languages.service';
import { MeasureService } from '../services/measures.service';
import { PaginationService } from '../services/pagination.service';
import { PiaService } from '../services/pia.service';
import { RevisionService } from '../services/revision.service';
import { SidStatusService } from '../services/sid-status.service';
import { StructureService } from '../services/structure.service';
import { UsersService } from '../services/users.service';
import { ComponentTestData } from './component-test-data';

function resolvedSpy(name: string, value: any) {
  return jasmine.createSpy(name).and.returnValue(Promise.resolve(value));
}

const serviceFactories = {
  ActionPlanService: (data: ComponentTestData) => ({
    token: ActionPlanService,
    value: {
      data: data.data,
      pia: data.pia,
      results: [],
      measures: [],
      risks: { '3.2': null, '3.3': null, '3.4': null },
      csvRows: [],
      listActionPlan: resolvedSpy('listActionPlan', undefined),
    },
  }),
  AnswerService: () => ({
    token: AnswerService,
    value: {
      getByReferenceAndPia: resolvedSpy('getByReferenceAndPia', null),
      findAllByPia: resolvedSpy('findAllByPia', []),
      getGaugeByPia: resolvedSpy('getGaugeByPia', []),
      create: resolvedSpy('create', null),
      update: resolvedSpy('update', null),
    },
  }),
  AnswerStructureService: () => ({
    token: AnswerStructureService,
    value: {
      addQuestion: resolvedSpy('addQuestion', null),
      addMeasure: resolvedSpy('addMeasure', null),
    },
  }),
  ApiService: () => ({ token: ApiService, value: { base: null } }),
  AppDataService: (data: ComponentTestData) => ({
    token: AppDataService,
    value: {
      dataNav: data.data,
      entrieMode: 'pia',
      contrastMode: false,
      resetDataNav: jasmine.createSpy('resetDataNav'),
    },
  }),
  ArchiveService: () => ({
    token: ArchiveService,
    value: { getAll: resolvedSpy('getAll', []) },
  }),
  AttachmentsService: () => ({
    token: AttachmentsService,
    value: {
      findAllByPia: resolvedSpy('findAllByPia', []),
      updateSignedAttachmentsList: resolvedSpy(
        'updateSignedAttachmentsList',
        []
      ),
    },
  }),
  AuthService: () => ({
    token: AuthService,
    value: {
      state: false,
      currentUser: of(null),
      currentUserValue: null,
      logout: jasmine.createSpy('logout'),
    },
  }),
  CommentsService: () => ({
    token: CommentsService,
    value: { findAllByReference: resolvedSpy('findAllByReference', []) },
  }),
  DialogService: () => {
    const messages = new Subject();
    return {
      token: DialogService,
      value: {
        getMessage: () => messages.asObservable(),
        confirmThis: jasmine.createSpy('confirmThis'),
      },
    };
  },
  EvaluationService: () => ({
    token: EvaluationService,
    value: {
      getByReference: resolvedSpy('getByReference', null),
      findAllByPia: resolvedSpy('findAllByPia', []),
      getStatusName: jasmine.createSpy('getStatusName').and.returnValue(''),
      update: resolvedSpy('update', null),
    },
  }),
  GlobalEvaluationService: () => ({
    token: GlobalEvaluationService,
    value: {
      status: 0,
      answerEditionEnabled: true,
      evaluationEditionEnabled: false,
      behaviorSubject: new BehaviorSubject({}),
      validate: resolvedSpy('validate', { reference_to: '1.1', status: 0 }),
      prepareForEvaluation: resolvedSpy('prepareForEvaluation', undefined),
    },
  }),
  IntrojsService: () => ({
    token: IntrojsService,
    value: {
      entrySideViewChange: new Subject(),
      sectionsChange: new Subject(),
      evaluationsChange: new Subject(),
      start: jasmine.createSpy('start'),
      reset: jasmine.createSpy('reset'),
    },
  }),
  KnowledgeBaseService: (data: ComponentTestData) => ({
    token: KnowledgeBaseService,
    value: {
      allKnowledgeBaseData: [],
      knowledgeBaseData: [],
      previousKnowledgeBaseData: [],
      toHide: [],
      get: resolvedSpy('get', data.base),
      getAll: resolvedSpy('getAll', []),
      loadByItem: jasmine.createSpy('loadByItem'),
      loadData: jasmine.createSpy('loadData'),
      search: jasmine.createSpy('search'),
    },
  }),
  KnowledgesService: () => ({
    token: KnowledgesService,
    value: { getEntries: resolvedSpy('getEntries', []) },
  }),
  LanguagesService: () => ({
    token: LanguagesService,
    value: {
      selectedLanguage: 'en',
      initLanguages: jasmine.createSpy('initLanguages'),
      getOrSetCurrentLanguage: jasmine.createSpy('getOrSetCurrentLanguage'),
      updateCurrentLanguage: jasmine.createSpy('updateCurrentLanguage'),
    },
  }),
  MeasureService: (data: ComponentTestData) => ({
    token: MeasureService,
    value: {
      behaviorSubject: new BehaviorSubject<string>(null),
      find: resolvedSpy('find', data.measure),
      findAllByPia: resolvedSpy('findAllByPia', []),
      listMeasures: resolvedSpy('listMeasures', []),
    },
  }),
  PaginationService: () => ({
    token: PaginationService,
    value: {
      previousLink: [1, 1, 'Previous'],
      nextLink: [1, 2, 'Next'],
      hasPreviousLink: false,
      hasNextLink: true,
      setPagination: jasmine.createSpy('setPagination'),
    },
  }),
  PiaService: (data: ComponentTestData) => ({
    token: PiaService,
    value: {
      find: resolvedSpy('find', data.pia),
      getPiaExample: resolvedSpy('getPiaExample', data.pia),
      getAllActives: resolvedSpy('getAllActives', []),
      calculPiaProgress: resolvedSpy('calculPiaProgress', undefined),
      export: resolvedSpy('export', '{}'),
      getStatusName: jasmine.createSpy('getStatusName').and.returnValue(''),
      getGaugeName: jasmine.createSpy('getGaugeName').and.returnValue(''),
    },
  }),
  RevisionService: () => ({
    token: RevisionService,
    value: { findAllByPia: resolvedSpy('findAllByPia', []) },
  }),
  SidStatusService: () => ({
    token: SidStatusService,
    value: {
      itemStatus: {},
      structureStatus: {},
      sidStatusIcon: {},
      specialIcon: {},
      setSidStatus: resolvedSpy('setSidStatus', undefined),
      setStructureStatus: jasmine.createSpy('setStructureStatus'),
    },
  }),
  StructureService: (data: ComponentTestData) => ({
    token: StructureService,
    value: {
      find: resolvedSpy('find', data.structure),
      loadExample: resolvedSpy('loadExample', data.structure),
      getAll: resolvedSpy('getAll', []),
      update: resolvedSpy('update', data.structure),
    },
  }),
  UsersService: () => ({
    token: UsersService,
    value: { getUsers: resolvedSpy('getUsers', []) },
  }),
};

export function mockComponentServices(
  data: ComponentTestData,
  ...names: Array<keyof typeof serviceFactories>
): void {
  for (const name of names) {
    const { token, value } = serviceFactories[name](data);
    TestBed.overrideProvider(token, { useValue: value });
  }
}

export function setComponentTestRoute(): void {
  const route = TestBed.inject(ActivatedRoute);
  const params = { id: '1', section_id: '1', item_id: '1' };
  route.snapshot.params = params;
  route.params = of(params);
}
