'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`<nav>
    <ul class="list">
        <li class="title">
            <a href="index.html" data-type="index-link">pia documentation</a>
        </li>
        <li class="divider"></li>
        ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
</div>
` : '' }
        <li class="chapter">
            <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
            <ul class="links">
                    <li class="link">
                        <a href="overview.html" data-type="chapter-link">
                            <span class="icon ion-ios-keypad"></span>Overview
                        </a>
                    </li>
                    <li class="link">
                        <a href="index.html" data-type="chapter-link">
                            <span class="icon ion-ios-paper"></span>README
                        </a>
                    </li>
                    <li class="link">
                            <a href="license.html"
                        data-type="chapter-link">
                            <span class="icon ion-ios-paper"></span>LICENSE
                        </a>
                    </li>
                    <li class="link">
                        <a href="dependencies.html"
                            data-type="chapter-link">
                            <span class="icon ion-ios-list"></span>Dependencies
                        </a>
                    </li>
            </ul>
        </li>
        <li class="chapter modules">
            <a data-type="chapter-link" href="modules.html">
                <div class="menu-toggler linked" data-toggle="collapse"
                    ${ isNormalMode ? 'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                    <span class="icon ion-ios-archive"></span>
                    <span class="link-name">Modules</span>
                    <span class="icon ion-ios-arrow-down"></span>
                </div>
            </a>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                    <li class="link">
                        <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-AppModule-6f1efad1c052e6e57902cd2b9578fc5b"' : 'data-target="#xs-components-links-module-AppModule-6f1efad1c052e6e57902cd2b9578fc5b"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-AppModule-6f1efad1c052e6e57902cd2b9578fc5b"' : 'id="xs-components-links-module-AppModule-6f1efad1c052e6e57902cd2b9578fc5b"' }>
                                        <li class="link">
                                            <a href="components/AboutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AboutComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ActionPlanComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActionPlanComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ActionPlanImplementationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActionPlanImplementationComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AttachmentItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AttachmentItemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AttachmentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AttachmentsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/AuthenticationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">AuthenticationComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CardItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CardItemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CardsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CardsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CommentItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CommentItemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/CommentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">CommentsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/DPOPeopleOpinionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">DPOPeopleOpinionsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/EntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EntryComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/EntryContentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EntryContentComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ErrorsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ErrorsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/EvaluationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EvaluationsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/HelpComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">HelpComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ListItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ListItemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/MeasuresComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">MeasuresComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/OverviewRisksComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">OverviewRisksComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/PiaValidateHistoryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">PiaValidateHistoryComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/QuestionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">QuestionsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/RefusePIAComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">RefusePIAComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/RisksCartographyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">RisksCartographyComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SectionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SectionsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SettingsComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/SummaryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SummaryComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ValidatePIAComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ValidatePIAComponent</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                    </li>
                    <li class="link">
                        <a href="modules/CardsRoutingModule.html" data-type="entity-link">CardsRoutingModule</a>
                    </li>
                    <li class="link">
                        <a href="modules/EntryRoutingModule.html" data-type="entity-link">EntryRoutingModule</a>
                    </li>
                    <li class="link">
                        <a href="modules/SharedModule.html" data-type="entity-link">SharedModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'data-target="#xs-components-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'id="xs-components-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                        <li class="link">
                                            <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/KnowledgeBaseComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">KnowledgeBaseComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/KnowledgeBaseItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">KnowledgeBaseItemComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/ModalsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">ModalsComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#injectables-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'data-target="#xs-injectables-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                    <span class="icon ion-md-arrow-round-down"></span>
                                    <span>Injectables</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="injectables-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'id="xs-injectables-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                        <li class="link">
                                            <a href="injectables/ActionPlanService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>ActionPlanService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AppDataService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>AppDataService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AttachmentsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>AttachmentsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/GlobalEvaluationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>GlobalEvaluationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/KnowledgeBaseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>KnowledgeBaseService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LanguagesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>LanguagesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MeasureService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>MeasureService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ModalsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>ModalsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PaginationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>PaginationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SidStatusService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>SidStatusService</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#pipes-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'data-target="#xs-pipes-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                    <span class="icon ion-md-add"></span>
                                    <span>Pipes</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="pipes-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' : 'id="xs-pipes-links-module-SharedModule-7aed26cd8500cb0ddc7d417768a2b01c"' }>
                                        <li class="link">
                                            <a href="pipes/Nl2brPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">Nl2brPipe</a>
                                        </li>
                                        <li class="link">
                                            <a href="pipes/SafeHtmlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">SafeHtmlPipe</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/StructuresModule.html" data-type="entity-link">StructuresModule</a>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#components-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' : 'data-target="#xs-components-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' }>
                                    <span class="icon ion-md-cog"></span>
                                    <span>Components</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="components-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' : 'id="xs-components-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' }>
                                        <li class="link">
                                            <a href="components/EntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">EntryComponent</a>
                                        </li>
                                        <li class="link">
                                            <a href="components/StructuresComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules">StructuresComponent</a>
                                        </li>
                                </ul>
                            </li>
                            <li class="chapter inner">
                                <div class="simple menu-toggler" data-toggle="collapse"
                                    ${ isNormalMode ? 'data-target="#injectables-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' : 'data-target="#xs-injectables-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' }>
                                    <span class="icon ion-md-arrow-round-down"></span>
                                    <span>Injectables</span>
                                    <span class="icon ion-ios-arrow-down"></span>
                                </div>
                                <ul class="links collapse"
                                    ${ isNormalMode ? 'id="injectables-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' : 'id="xs-injectables-links-module-StructuresModule-43e4d228eef557d662ddbccedc75d8cd"' }>
                                        <li class="link">
                                            <a href="injectables/AnswerStructureService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules"}>AnswerStructureService</a>
                                        </li>
                                </ul>
                            </li>
                    </li>
                    <li class="link">
                        <a href="modules/StructuresRoutingModule.html" data-type="entity-link">StructuresRoutingModule</a>
                    </li>
            </ul>
        </li>
                <li class="chapter">
                    <div class="simple menu-toggler" data-toggle="collapse"
                    ${ isNormalMode ? 'data-target="#components-links"' : 'data-target="#xs-components-links"' }>
                        <span class="icon ion-md-cog"></span>
                        <span>Components</span>
                        <span class="icon ion-ios-arrow-down"></span>
                    </div>
                    <ul class="links collapse"
                    ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AboutComponent.html" data-type="entity-link">AboutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActionPlanComponent.html" data-type="entity-link">ActionPlanComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActionPlanImplementationComponent.html" data-type="entity-link">ActionPlanImplementationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AttachmentItemComponent.html" data-type="entity-link">AttachmentItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AttachmentsComponent.html" data-type="entity-link">AttachmentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthenticationComponent.html" data-type="entity-link">AuthenticationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardItemComponent.html" data-type="entity-link">CardItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardItemComponent-1.html" data-type="entity-link">CardItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardsComponent.html" data-type="entity-link">CardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CommentItemComponent.html" data-type="entity-link">CommentItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CommentsComponent.html" data-type="entity-link">CommentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DPOPeopleOpinionsComponent.html" data-type="entity-link">DPOPeopleOpinionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EntryComponent-1.html" data-type="entity-link">EntryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EntryContentComponent.html" data-type="entity-link">EntryContentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EntryContentComponent-1.html" data-type="entity-link">EntryContentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorsComponent.html" data-type="entity-link">ErrorsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EvaluationsComponent.html" data-type="entity-link">EvaluationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link">HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpComponent.html" data-type="entity-link">HelpComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KnowledgeBaseComponent.html" data-type="entity-link">KnowledgeBaseComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KnowledgeBaseItemComponent.html" data-type="entity-link">KnowledgeBaseItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListItemComponent.html" data-type="entity-link">ListItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListItemComponent-1.html" data-type="entity-link">ListItemComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MeasuresComponent.html" data-type="entity-link">MeasuresComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MeasuresComponent-1.html" data-type="entity-link">MeasuresComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModalsComponent.html" data-type="entity-link">ModalsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OverviewRisksComponent.html" data-type="entity-link">OverviewRisksComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PiaValidateHistoryComponent.html" data-type="entity-link">PiaValidateHistoryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QuestionsComponent.html" data-type="entity-link">QuestionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QuestionsComponent-1.html" data-type="entity-link">QuestionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RefusePIAComponent.html" data-type="entity-link">RefusePIAComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RisksCartographyComponent.html" data-type="entity-link">RisksCartographyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SectionsComponent.html" data-type="entity-link">SectionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SectionsComponent-1.html" data-type="entity-link">SectionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingsComponent.html" data-type="entity-link">SettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SummaryComponent.html" data-type="entity-link">SummaryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ValidatePIAComponent.html" data-type="entity-link">ValidatePIAComponent</a>
                            </li>
                    </ul>
                </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#classes-links"' : 'data-target="#xs-classes-links"' }>
                <span class="icon ion-ios-paper"></span>
                <span>Classes</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                    <li class="link">
                        <a href="classes/Answer.html" data-type="entity-link">Answer</a>
                    </li>
                    <li class="link">
                        <a href="classes/ApplicationDb.html" data-type="entity-link">ApplicationDb</a>
                    </li>
                    <li class="link">
                        <a href="classes/Attachment.html" data-type="entity-link">Attachment</a>
                    </li>
                    <li class="link">
                        <a href="classes/Comment.html" data-type="entity-link">Comment</a>
                    </li>
                    <li class="link">
                        <a href="classes/Evaluation.html" data-type="entity-link">Evaluation</a>
                    </li>
                    <li class="link">
                        <a href="classes/Measure.html" data-type="entity-link">Measure</a>
                    </li>
                    <li class="link">
                        <a href="classes/Pia.html" data-type="entity-link">Pia</a>
                    </li>
                    <li class="link">
                        <a href="classes/Structure.html" data-type="entity-link">Structure</a>
                    </li>
            </ul>
        </li>
                <li class="chapter">
                    <div class="simple menu-toggler" data-toggle="collapse"
                        ${ isNormalMode ? 'data-target="#injectables-links"' : 'data-target="#xs-injectables-links"' }>
                        <span class="icon ion-md-arrow-round-down"></span>
                        <span>Injectables</span>
                        <span class="icon ion-ios-arrow-down"></span>
                    </div>
                    <ul class="links collapse"
                    ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                            <li class="link">
                                <a href="injectables/ActionPlanService.html" data-type="entity-link">ActionPlanService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/AnswerStructureService.html" data-type="entity-link">AnswerStructureService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/AppDataService.html" data-type="entity-link">AppDataService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/AttachmentsService.html" data-type="entity-link">AttachmentsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/GlobalEvaluationService.html" data-type="entity-link">GlobalEvaluationService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/KnowledgeBaseService.html" data-type="entity-link">KnowledgeBaseService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/LanguagesService.html" data-type="entity-link">LanguagesService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/MeasureService.html" data-type="entity-link">MeasureService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/ModalsService.html" data-type="entity-link">ModalsService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/PaginationService.html" data-type="entity-link">PaginationService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/PaginationService-1.html" data-type="entity-link">PaginationService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/PiaService.html" data-type="entity-link">PiaService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/SidStatusService.html" data-type="entity-link">SidStatusService</a>
                            </li>
                            <li class="link">
                                <a href="injectables/StructureService.html" data-type="entity-link">StructureService</a>
                            </li>
                    </ul>
                </li>
        <li class="chapter">
            <div class="simple menu-toggler" data-toggle="collapse"
            ${ isNormalMode ? 'data-target="#miscellaneous-links"' : 'data-target="#xs-miscellaneous-links"' }>
                <span class="icon ion-ios-cube"></span>
                <span>Miscellaneous</span>
                <span class="icon ion-ios-arrow-down"></span>
            </div>
            <ul class="links collapse"
            ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                    <li class="link">
                      <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                    </li>
                    <li class="link">
                      <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                    </li>
            </ul>
        </li>
            <li class="chapter">
                <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
            </li>
        <li class="chapter">
            <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
        </li>
        <li class="divider"></li>
        <li class="copyright">
                Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.svg" class="img-responsive" data-type="compodoc-logo">
                </a>
        </li>
    </ul>
</nav>`);
        this.innerHTML = tp.strings;
    }
});
