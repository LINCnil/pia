// temporary service aliasing
// to avoid naming collision with existing PIA-CNIL services

export {
    ProcessingService as ProcessingApi,
    PiaService as PiaApi,
    AnswerService as AnswerApi,
    CommentService as CommentApi,
    EvaluationService as EvaluationApi,
    MeasureService as MeasureApi,
    AttachmentService as AttachmentApi,
    UserProfileService as UserProfileApi,
    UserTokenService as UserTokenApi,
    TemplateService as TemplateApi,
    FolderService as FolderApi,
    ProcessingDataTypeService as ProcessingDataTypeApi,
    StructureService as StructureApi,
    ProcessingCommentService as ProcessingCommentApi,
    ProcessingAttachmentService as ProcessingAttachmentApi
} from '@api/service';
