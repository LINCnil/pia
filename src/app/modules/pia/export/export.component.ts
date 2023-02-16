import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import { svgAsPngUri } from 'save-svg-as-png';
import * as html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

// import { SafeHtmlPipe } from '../../../tools';

import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';

import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { AuthService } from 'src/app/services/auth.service';
import { MeasureService } from 'src/app/services/measures.service';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { AnswerService } from 'src/app/services/answer.service';

import { Pia } from 'src/app/models/pia.model';
declare const require: any;

function slugify(text): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  @Input() pia: Pia = null;
  csvContent: any;
  fromArchives = false;
  dataNav: any;
  csvOptions = {};
  exportSelected: Array<any> = [];
  piaJson: JSON;
  @Output() downloading = new EventEmitter();
  @Input() editMode = false;

  data: { sections: any };
  allData: object;

  constructor(
    private piaService: PiaService,
    private actionPlanService: ActionPlanService,
    private translateService: TranslateService,
    private appDataService: AppDataService,
    public attachmentsService: AttachmentsService,
    private measureService: MeasureService,
    public authService: AuthService,
    private answerService: AnswerService,
    private evaluationService: EvaluationService
  ) // private SafeHtmlPipe: SafeHtmlPipe
  {}

  ngOnInit(): void {
    this.dataNav = this.appDataService.dataNav;
    this.getJsonInfo();

    this.prepareCsv();
    this.piaService.export(this.pia.id).then((json: any) => {
      this.piaJson = json;
    });

    if (this.pia.is_archive === 1) {
      this.fromArchives = true;
    }
  }

  onSelectDownload(type: string, isChecked: boolean): void {
    if (isChecked) {
      this.exportSelected.push(type);
    } else {
      const index = this.exportSelected.indexOf(type);
      this.exportSelected.splice(index, 1);
    }
  }

  /**
   * open preview view to get all informations
   */
  async launchDownload(): Promise<void> {
    this.downloading.emit(true);
    setTimeout(async () => {
      this.onDownload().then(() => {
        this.downloading.emit(false);
      });
    }, 5000);
  }

  async onDownload(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.exportSelected) {
        if (this.exportSelected.length > 1) {
          // download by selection
          this.generateExportsZip('pia-full-content', this.exportSelected).then(
            () => {
              resolve();
            }
          );
        } else {
          // download only one element
          const fileTitle = 'pia-' + slugify(this.pia.name);
          switch (this.exportSelected[0]) {
            case 'pdf':
              this.generatePdf(true).then(() => {
                resolve();
              });
              break;
            case 'doc': // Only doc
              this.generateDoc('pia-full-content').then(() => {
                resolve();
              });
              break;
            case 'images': // Only images
              this.downloadAllGraphsAsImages().then(() => {
                resolve();
              });
              break;
            case 'json': // Only json
              this.piaService.export(this.pia.id).then((json: any) => {
                const downloadLink = document.createElement('a');
                document.body.appendChild(downloadLink);
                if (navigator.msSaveOrOpenBlob) {
                  window.navigator.msSaveBlob(json, fileTitle + '.json');
                } else {
                  const blob = new Blob([json], { type: 'text/plain' });
                  downloadLink.href = URL.createObjectURL(blob);
                  downloadLink.download = fileTitle + '.json';
                  downloadLink.click();
                  downloadLink.remove();
                }
                resolve();
              });
              break;
            case 'csv': // Only csv
              const csvName =
                fileTitle +
                '-' +
                slugify(
                  this.translateService.instant('summary.action_plan.title')
                ) +
                '.csv';
              const blob = this.csvToBlob(csvName);
              const downloadLink = document.createElement('a');
              document.body.appendChild(downloadLink);

              if (navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, csvName);
              } else {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = csvName;
                downloadLink.click();
              }
              resolve();
              break;
            default:
              break;
          }
        }
      }
    });
  }

  /**
   * Generate a ZIP with the docx + csv + json + all pictures
   * @param element block in the HTML view used to generate the docx in the zip
   * @param exports files to exports array ['doc', 'images', 'csv', 'json']
   */
  async generateExportsZip(element, exports: Array<string>): Promise<void> {
    const zipName = 'pia-' + slugify(this.pia.name) + '.zip';
    const JSZip = require('jszip');
    const zip = new JSZip();

    // Attach export files
    await this.addAttachmentsToZip(zip).then(async (zip2: any) => {
      if (exports.includes('pdf')) {
        this.generatePdf().then(pdf => {
          zip2.file('pia-' + slugify(this.pia.name) + '.pdf', pdf, {
            binary: true
          });
        });
      }

      if (exports.includes('doc')) {
        // Doc
        const dataDoc = await this.prepareDocFile(element);
        zip2.file('Doc/' + dataDoc.filename, dataDoc.blob);
      }

      if (exports.includes('json')) {
        // Json
        zip2.file('pia-' + slugify(this.pia.name) + '.json', this.piaJson, {
          binary: true
        });
      }

      if (exports.includes('csv')) {
        // Csv
        const fileTitle = this.translateService.instant(
          'summary.action_plan.title'
        );
        const blob = this.csvToBlob(fileTitle);
        zip2.file('CSV/' + slugify(fileTitle) + '.csv', blob, { binary: true });
      }

      if (exports.includes('images')) {
        // images
        await this.addImagesToZip(zip2).then(async (zip3: any) => {
          // Launch Download
          await zip3.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, zipName);
          });
        });
      } else {
        // Launch Download
        await zip2.generateAsync({ type: 'blob' }).then(blobContent => {
          FileSaver.saveAs(blobContent, zipName);
        });
      }
    });
  }

  exportCSVFile(headers, items, fileTitle): Blob {
    if (headers) {
      items.unshift(headers);
    }
    // Convert Object to JSON
    const jsonObject = JSON.stringify(items);
    const csv = this.convertToCSV(jsonObject);
    const exportedFilenmae = fileTitle + '.csv' || 'export.csv';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return blob;
  }

  convertToCSV(objArray): string {
    const array =
      typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < array.length; i++) {
      let line = '';
      // tslint:disable-next-line: forin
      for (const index in array[i]) {
        if (line !== '') {
          line += ',';
        }
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Prepare for CSV export
   */
  prepareCsv(): void {
    this.csvOptions = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      removeNewLines: true,
      headers: [
        `"${this.translateService.instant('summary.csv_section')}"`,
        `"${this.translateService.instant('summary.csv_title_object')}"`,
        `"${this.translateService.instant('summary.csv_action_plan_comment')}"`,
        `"${this.translateService.instant('summary.csv_evaluation_comment')}"`,
        `"${this.translateService.instant('summary.csv_implement_date')}"`,
        `"${this.translateService.instant('summary.csv_people_in_charge')}"`
      ]
    };
    this.csvContent = this.actionPlanService.csvRows;
  }

  csvToBlob(fileTitle): Blob {
    const headers = {
      section: `"${this.translateService.instant('summary.csv_section')}"`,
      title: `"${this.translateService.instant('summary.csv_title_object')}"`,
      action_plan_comment: `"${this.translateService.instant(
        'summary.csv_action_plan_comment'
      )}"`,
      evaluation_comment: `"${this.translateService.instant(
        'summary.csv_evaluation_comment'
      )}"`,
      csv_implement_date: `"${this.translateService.instant(
        'summary.csv_implement_date'
      )}"`,
      csv_people_in_charge: `"${this.translateService.instant(
        'summary.csv_people_in_charge'
      )}"`
    };

    const csvContentFormatted = [];
    this.csvContent.forEach(item => {
      const itemData = {};
      if (item.title) {
        itemData['title'] = `"${item.title}"`;
      }
      if (item.blank) {
        itemData['blank'] = `"${item.blank}"`;
      }
      if (item.short_title) {
        itemData['short_title'] = `"${item.short_title}"`;
      }
      if (item.action_plan_comment) {
        itemData[
          'action_plan_comment'
        ] = `"${item.action_plan_comment}"`
          .replace(/,/g, '')
          .replace(/\n/g, ' ');
      }
      if (item.evaluation_comment) {
        itemData['evaluation_comment'] = `"${item.evaluation_comment}"`
          .replace(/,/g, '')
          .replace(/\n/g, ' ');
      }
      if (item.evaluation_date) {
        itemData['evaluation_date'] = `"${item.evaluation_date}"`;
      }
      if (item.evaluation_charge) {
        itemData['evaluation_charge'] = `"${item.evaluation_charge}"`;
      }

      csvContentFormatted.push({
        title: itemData['title'],
        blank: itemData['blank'],
        short_title: itemData['short_title'],
        action_plan_comment: itemData['action_plan_comment'],
        evaluation_comment: itemData['evaluation_comment'],
        evaluation_date: itemData['evaluation_date'],
        evaluation_charge: itemData['evaluation_charge']
      });
    });

    return this.exportCSVFile(headers, csvContentFormatted, fileTitle);
  }

  /**
   *
   * @param element block in the HTML view used to generate the doc
   */
  async generateDoc(element): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.prepareDocFile(element).then(dataDoc => {
        setTimeout(() => {
          const downloadLink = document.createElement('a');
          document.body.appendChild(downloadLink);
          if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(dataDoc.blob, dataDoc.filename);
          } else {
            downloadLink.href = dataDoc.url;
            const newDate = new Date(Date.now());
            const data =
              newDate.getDate() +
              '-' +
              newDate.getMonth() +
              '-' +
              newDate.getFullYear();
            downloadLink.download = data + '-pia.doc';
            downloadLink.click();
          }
          document.body.removeChild(downloadLink);
          resolve(true);
        }, 500);
      });
    });
  }

  /**
   * Prepare .doc file
   */
  async prepareDocFile(element): Promise<any> {
    const headerTitle = `<h1>${this.pia.name}</h1>`;
    const headerData = document.querySelector(
      'header.pia-fullPreviewBlock-header .pia-fullPreviewBlock-header-data'
    );

    const risksCartography = document.querySelector('#risksCartographyImg');
    const actionPlanOverview = document.querySelector('#actionPlanOverviewImg');
    const risksOverview = document.querySelector('#risksOverviewSvg');

    if (risksCartography && actionPlanOverview && risksOverview) {
      document.querySelector('#risksCartographyImg').remove();
      document.querySelector('#actionPlanOverviewImg').remove();
      document.querySelector('#risksOverviewSvg').remove();
    }

    const preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const postHtml = '</body></html>';
    const html =
      preHtml +
      '<header>' +
      headerTitle +
      headerData.innerHTML +
      '</header>' +
      document.getElementById(element).innerHTML +
      postHtml;
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const risksCartographyContainer = document.querySelector(
      '.pia-risksCartographyContainer'
    );
    const actionPlanOverviewContainer = document.querySelector(
      '.pia-actionPlanGraphBlockContainer'
    );
    const risksOverviewContainer = document.querySelector(
      '.pia-risksOverviewBlock'
    );
    if (risksCartographyContainer) {
      risksCartographyContainer.appendChild(risksCartography);
    }
    if (actionPlanOverviewContainer) {
      actionPlanOverviewContainer.appendChild(actionPlanOverview);
    }
    if (risksOverviewContainer) {
      risksOverviewContainer.appendChild(risksOverview);
    }
    const newDate = new Date(Date.now());
    const data =
      newDate.getDate() +
      '-' +
      newDate.getMonth() +
      '-' +
      newDate.getFullYear();
    return {
      url:
        'data:application/vnd.ms-word;charset=utf-8,' +
        encodeURIComponent(html),
      blob,
      filename: data + '-pia.doc'
    };
  }

  /**
   * Add all active attachments (not the removed ones) to the zip after converting them as blob files
   * @param zip
   */
  async addAttachmentsToZip(zip): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.attachmentsService
        .findAllByPia(this.pia.id)
        .then((attachments: Array<any>) => {
          attachments.forEach(attachment => {
            if (attachment.file && attachment.file.length > 0) {
              const byteCharacters1 = atob(
                (attachment.file as any).split(',')[1]
              );
              const folderName = this.translateService.instant(
                'summary.attachments'
              );
              zip.file(folderName + '/' + attachment.name, byteCharacters1, {
                binary: true
              });
            }
          });
        });
      resolve(zip);
    });
  }

  /**
   * Download all graphs as images
   * @private
   */
  async downloadAllGraphsAsImages(): Promise<void> {
    const JSZip = require('jszip');
    const zip = new JSZip();
    return new Promise((resolve, reject) => {
      this.addImagesToZip(zip).then((zip2: any) => {
        zip2.generateAsync({ type: 'blob' }).then(blobContent => {
          FileSaver.saveAs(blobContent, 'pia-images.zip');
          resolve();
        });
      });
    });
  }

  /**
   * Add images to the zip after converting them as blob files
   * @param zip
   */
  async addImagesToZip(zip): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const actionPlanOverviewImg = await this.getActionPlanOverviewImg();
      const risksCartographyImg = await this.getRisksCartographyImg();
      const risksOverviewImg = await this.getRisksOverviewImgForZip();

      const byteCharacters1 = atob(
        (actionPlanOverviewImg as any).split(',')[1]
      );
      const byteCharacters2 = atob((risksCartographyImg as any).split(',')[1]);
      const byteCharacters3 = atob((risksOverviewImg as any).split(',')[1]);

      zip.file('Images/actionPlanOverview.png', byteCharacters1, {
        binary: true
      });
      zip.file('Images/risksCartography.png', byteCharacters2, {
        binary: true
      });
      zip.file('Images/risksOverview.png', byteCharacters3, { binary: true });
      resolve(zip);
    });
  }

  /**
   * Download the action plan overview as an image
   * @async
   */
  async getActionPlanOverviewImg(): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const actionPlanOverviewImg = document.querySelector(
          '#actionPlanOverviewImg'
        );
        if (actionPlanOverviewImg) {
          html2canvas(actionPlanOverviewImg as HTMLElement, {
            scale: 1.4
          }).then(canvas => {
            if (canvas) {
              const img = canvas.toDataURL();
              resolve(img);
            }
          });
        }
      }, 0);
    });
  }

  /**
   * Download the risks cartography as an image
   * @async
   */
  async getRisksCartographyImg(): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const risksCartographyImg = document.querySelector(
          '#risksCartographyImg'
        );
        if (risksCartographyImg) {
          html2canvas(risksCartographyImg as HTMLElement, { scale: 1.4 }).then(
            canvas => {
              if (canvas) {
                const img = canvas.toDataURL();
                resolve(img);
              }
            }
          );
        }
      }, 250);
    });
  }

  /**
   * Generate a data format from the risk overview image. It can then be used in the Zip.
   * @async
   */
  async getRisksOverviewImgForZip(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mysvg = document.getElementById('risksOverviewSvg');
        if (mysvg) {
          svgAsPngUri(mysvg, {}, uri => {
            resolve(uri);
          });
        }
      }, 250);
    });
  }

  // RESTE A FAIRE :
  // INTÉGRER LE PDF DANS LE ZIP (SANS QUE ÇA LE DL EN //) ?
  // AJOUTER LES GRAPHES
  // PLAN d'action
  // Page DPO
  // PURIFY DES TAGS

  /**
   * Generate a .pdf document for the PIA report.
   * @param autosave
   */
  async generatePdf(autosave = false) {
    // this.getRisksCartographyImg(),
    // this.getRisksOverviewImgForZip()

    // Pdf general configuration variables
    const doc = new jsPDF('portrait', 'pt');
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();
    let pageSize = 40;

    // Check current page height
    function testPdfSize(y) {
      if (y >= pageHeight - 10) {
        doc.addPage();
        y = 20;
        pageSize = 20;
      }
      return y;
    }

    /**
     * Insert new content
     * @param content : content to print
     * @param x : position on x axis starting from the left of the page
     * @param y : position on y axis starting from the top of the page
     * @param fontSize : the font size of the content to print
     * @param lineSpacing : the spacing between each line of the content (do not confuse with pageSize!)
     */
    function writeBoldText(content, x, y, fontSize = 12, lineSpacing = 12) {
      doc.setFontSize(fontSize);
      let startY = y;
      let startX = x;
      const textMap = doc.splitTextToSize(
        content,
        doc.internal.pageSize.width - x - 20
      );

      textMap.map(text => {
        startY = testPdfSize(startY);
        const arrayOfNormalAndBoldText = text.split('**');
        arrayOfNormalAndBoldText.map((textItems, i) => {
          doc.setFont(undefined, i % 2 === 0 ? 'normal' : 'bold');
          doc.text(textItems, startX, startY);

          startX += doc.getStringUnitWidth(textItems) * fontSize;
        });
        pageSize += lineSpacing;
        startY += lineSpacing;
        startX = x;
      });
    }

    // Remove HTML tags from a string
    function purifyString(string) {
      // <li> ---> "- "
      // <strong> et </strong> ---> "**" ?

      // TODO: il reste encore des <div> </div> <br />, re-vérifier les autres tags aussi !!!
      const htmlRegex1 = /<div>/g;
      // const htmlRegex2 = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

      string = string.replace(htmlRegex1, '');
      // string = string.replace(htmlRegex2, '');
      return string;
    }

    // Display questions for a specific section and item
    function displayQuestions(
      dataNavSectionId,
      dataNavItemId,
      allDataSectionId,
      allDataItemId,
      dataNav,
      allData,
      translateService
    ) {
      for (const question of dataNav['sections'][dataNavSectionId]['items'][
        dataNavItemId
      ]['questions']) {
        // Question title
        doc.setTextColor('#091c6B');
        writeBoldText(
          translateService.instant(question.title),
          20,
          testPdfSize(pageSize),
          12,
          20
        );

        // Question answer
        doc.setTextColor('#000');
        const questionAnswer =
          allData[allDataSectionId][allDataItemId][question.id].content;
        // writeBoldText(this.SafeHtmlPipe.transform(questionAnswer), 20, testPdfSize(pageSize), 10, 12);
        writeBoldText(
          purifyString(questionAnswer),
          20,
          testPdfSize(pageSize),
          10,
          12
        );

        // AJOUTER PURIFY STRING PARTOUT !

        pageSize += 10;

        // Question evaluation (if any)
        if (allData[allDataSectionId][allDataItemId][question.id].evaluation) {
          pageSize += 20;
          doc.setDrawColor('#000');
          doc.line(20, pageSize - 20, pageWidth - 30, pageSize - 20);

          // Question evaluation value
          const questionEvaluationTitle = `**${translateService.instant(
            'evaluations.title'
          )}** : ${translateService.instant(
            allData[allDataSectionId][allDataItemId][question.id].evaluation
              .title
          )}`;
          writeBoldText(
            questionEvaluationTitle,
            20,
            testPdfSize(pageSize),
            10,
            12
          );
          pageSize += 10;

          // Question evaluation action plan comment
          if (
            allData[allDataSectionId][allDataItemId][question.id].evaluation
              .action_plan_comment
          ) {
            const questionEvaluationActionPlanComment = `**${translateService.instant(
              'evaluations.action_plan_comment'
            )}** : ${
              allData[allDataSectionId][allDataItemId][question.id].evaluation
                .action_plan_comment
            }`;
            writeBoldText(
              questionEvaluationActionPlanComment,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }

          // Question evaluation comment
          if (
            allData[allDataSectionId][allDataItemId][question.id].evaluation
              .evaluation_comment
          ) {
            const questionEvaluationComment = `**${translateService.instant(
              'evaluations.evaluation_comment'
            )}** : ${
              allData[allDataSectionId][allDataItemId][question.id].evaluation
                .evaluation_comment
            }`;
            writeBoldText(
              questionEvaluationComment,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }
        }

        pageSize += 20;
      }
    }

    // Display measures for a specific section and item
    function displayMeasures(allData, translateService) {
      for (const measure of allData[3][1]) {
        // Measure title
        doc.setTextColor('#091c6B');
        writeBoldText(measure.title, 20, testPdfSize(pageSize), 12, 20);

        // Measure content
        doc.setTextColor('#000');
        writeBoldText(measure.content, 20, testPdfSize(pageSize), 10, 12);
        pageSize += 10;

        // Measure evaluation (if any)
        if (measure.evaluation) {
          pageSize += 20;
          doc.setDrawColor('#000');
          doc.line(20, pageSize - 20, pageWidth - 30, pageSize - 20);

          // Measure evaluation value
          const measureEvaluationTitle = `**${translateService.instant(
            'evaluations.title'
          )}** : ${translateService.instant(measure.evaluation.title)}`;
          writeBoldText(
            measureEvaluationTitle,
            20,
            testPdfSize(pageSize),
            10,
            12
          );
          pageSize += 10;

          // Measure evaluation action plan comment
          if (measure.evaluation.action_plan_comment) {
            const measureEvaluationActionPlanComment = `**${translateService.instant(
              'evaluations.action_plan_comment'
            )}** : ${measure.evaluation.action_plan_comment}`;
            writeBoldText(
              measureEvaluationActionPlanComment,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }

          // Measure evaluation comment
          if (measure.evaluation.evaluation_comment) {
            const measureEvaluationComment = `**${translateService.instant(
              'evaluations.evaluation_comment'
            )}** : ${measure.evaluation.evaluation_comment}`;
            writeBoldText(
              measureEvaluationComment,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }
        }

        pageSize += 20;
      }
    }

    // Display the global evaluation for a specific item (if any)
    function displayItemEvaluation(
      allDataSectionId,
      allDataItemId,
      allData,
      translateService
    ) {
      if (allData[allDataSectionId][allDataItemId]['evaluation_item']) {
        pageSize += 20;
        doc.setDrawColor('#000');
        doc.line(20, pageSize - 20, pageWidth - 30, pageSize - 20);

        // Evaluation value
        const evaluationTitle = `**${translateService.instant(
          'evaluations.title'
        )}** : ${translateService.instant(
          allData[allDataSectionId][allDataItemId]['evaluation_item'].title
        )}`;
        writeBoldText(evaluationTitle, 20, testPdfSize(pageSize), 10, 12);
        pageSize += 10;

        // Evaluation action plan comment
        if (
          allData[allDataSectionId][allDataItemId]['evaluation_item']
            .action_plan_comment
        ) {
          const evaluationActionPlanComment = `**${translateService.instant(
            'evaluations.action_plan_comment'
          )}** : ${
            allData[allDataSectionId][allDataItemId]['evaluation_item']
              .action_plan_comment
          }`;
          writeBoldText(
            evaluationActionPlanComment,
            20,
            testPdfSize(pageSize),
            10,
            12
          );
          pageSize += 10;
        }

        // Evaluation comment
        if (
          allData[allDataSectionId][allDataItemId]['evaluation_item']
            .evaluation_comment
        ) {
          const evaluationComment = `**${translateService.instant(
            'evaluations.evaluation_comment'
          )}** : ${
            allData[allDataSectionId][allDataItemId]['evaluation_item']
              .evaluation_comment
          }`;
          writeBoldText(evaluationComment, 20, testPdfSize(pageSize), 10, 12);
          pageSize += 10;
        }

        // Evaluation gauges
        if (
          allData[allDataSectionId][allDataItemId]['evaluation_item'].gauges
        ) {
          if (
            allData[allDataSectionId][allDataItemId]['evaluation_item'].gauges
              .seriousness > 0
          ) {
            const evaluationGaugeSeriousness = `**${translateService.instant(
              'evaluations.gauges.seriousness'
            )}** : ${translateService.instant(
              'evaluations.gauges.' +
                allData[allDataSectionId][allDataItemId]['evaluation_item']
                  .gauges.seriousness
            )}`;
            writeBoldText(
              evaluationGaugeSeriousness,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }
          if (
            allData[allDataSectionId][allDataItemId]['evaluation_item'].gauges
              .likelihood > 0
          ) {
            const evaluationGaugeLikelihood = `**${translateService.instant(
              'evaluations.gauges.likelihood'
            )}** : ${translateService.instant(
              'evaluations.gauges.' +
                allData[allDataSectionId][allDataItemId]['evaluation_item']
                  .gauges.likelihood
            )}`;
            writeBoldText(
              evaluationGaugeLikelihood,
              20,
              testPdfSize(pageSize),
              10,
              12
            );
            pageSize += 10;
          }
        }
      }
    }

    // Generate the header of a specific section and item
    function generateHeader(
      color,
      dataNav,
      dataNavSectionId,
      dataNavItemId,
      translateService
    ) {
      doc.setFillColor(color);
      doc.rect(20, 20, 74, 50, 'F');
      doc.setDrawColor('#aaa');
      doc.rect(20, 20, pageWidth - 40, 50);
      writeBoldText(
        translateService.instant(dataNav['sections'][dataNavSectionId].title),
        105,
        testPdfSize(pageSize),
        16,
        20
      );
      writeBoldText(
        translateService.instant(
          dataNav['sections'][dataNavSectionId]['items'][dataNavItemId].title
        ),
        105,
        testPdfSize(pageSize),
        14,
        40
      );
    }

    // MAIN PIA DATA
    doc.setFillColor('#3c3b3d');
    doc.rect(20, 20, 74, 50, 'F');
    doc.setDrawColor('#aaa');
    doc.rect(20, 20, pageWidth - 40, 50);
    writeBoldText(
      this.translateService.instant('summary.preview_subtitle'),
      105,
      testPdfSize(pageSize),
      16,
      20
    );
    writeBoldText(this.pia.name, 105, testPdfSize(pageSize), 14, 40);

    const piaAuthor = `**${this.translateService.instant(
      'summary.preview_edition'
    )}** : ${this.getUsersList('author', 'author_name')}`;
    writeBoldText(piaAuthor, 20, testPdfSize(pageSize), 12, 20);
    const piaEvaluator = `**${this.translateService.instant(
      'summary.preview_evaluation'
    )}** : ${this.getUsersList('evaluator', 'evaluator_name')}`;
    writeBoldText(piaEvaluator, 20, testPdfSize(pageSize), 12, 20);
    const piaValidator = `**${this.translateService.instant(
      'summary.preview_validation'
    )}** : ${this.getUsersList('validator', 'validator_name')}`;
    writeBoldText(piaValidator, 20, testPdfSize(pageSize), 12, 20);
    if (this.authService.state) {
      const piaGuests = `**${this.translateService.instant(
        'summary.preview_guests'
      )}** : ${this.getUsersList('guest')}`;
      writeBoldText(piaGuests, 20, testPdfSize(pageSize), 12, 20);
    }
    const piaStatusAndProgress = `**${this.translateService.instant(
      'summary.preview_status'
    )}** : ${this.translateService.instant(
      this.piaService.getStatusName(this.pia.status)
    )} (${this.pia.progress}%)`;
    writeBoldText(piaStatusAndProgress, 20, testPdfSize(pageSize), 12, 20);

    // SECTION 1 - "CONTEXT"

    // SECTION 1 - SUBSECTION 1 - "OVERVIEW"
    doc.addPage();
    pageSize = 40;
    generateHeader('#3ee095', this.dataNav, 0, 0, this.translateService);
    displayQuestions(
      0,
      0,
      1,
      1,
      this.dataNav,
      this.allData,
      this.translateService
    );
    displayItemEvaluation(1, 1, this.allData, this.translateService);

    // SECTION 1 - SUBSECTION 2 - "DATA, PROCESSES AND SUPPORTING ASSETS"
    doc.addPage();
    pageSize = 40;
    generateHeader('#3ee095', this.dataNav, 0, 1, this.translateService);
    displayQuestions(
      0,
      1,
      1,
      2,
      this.dataNav,
      this.allData,
      this.translateService
    );
    displayItemEvaluation(1, 2, this.allData, this.translateService);

    // SECTION 2 - "FUNDAMENTAL PRINCIPLES"

    // SECTION 2 - SUBSECTION 1 - "PROPORTIONALITY AND NECESSITY"
    doc.addPage();
    pageSize = 40;
    generateHeader('#091c6b', this.dataNav, 1, 0, this.translateService);
    displayQuestions(
      1,
      0,
      2,
      1,
      this.dataNav,
      this.allData,
      this.translateService
    );

    // SECTION 2 - SUBSECTION 2 - "CONTROLS TO PROTECT THE PERSONAL RIGHTS OF DATA SUBJECTS"
    doc.addPage();
    pageSize = 40;
    generateHeader('#091c6b', this.dataNav, 1, 1, this.translateService);
    displayQuestions(
      1,
      1,
      2,
      2,
      this.dataNav,
      this.allData,
      this.translateService
    );

    // SECTION 3 - "RISKS"

    // SECTION 3 - SUBSECTION 1 - "PLANNED OR EXISTING MEASURES"
    doc.addPage();
    pageSize = 40;
    generateHeader('#df4664', this.dataNav, 2, 0, this.translateService);
    displayMeasures(this.allData, this.translateService);

    // SECTION 3 - SUBSECTION 2 - "ILLEGITIMATE ACCESS TO DATA"
    doc.addPage();
    pageSize = 40;
    generateHeader('#df4664', this.dataNav, 2, 1, this.translateService);
    displayQuestions(
      2,
      1,
      3,
      2,
      this.dataNav,
      this.allData,
      this.translateService
    );
    displayItemEvaluation(3, 2, this.allData, this.translateService);

    // SECTION 3 - SUBSECTION 3 - "UNWANTED MODIFICATION OF DATA"
    doc.addPage();
    pageSize = 40;
    generateHeader('#df4664', this.dataNav, 2, 2, this.translateService);
    displayQuestions(
      2,
      2,
      3,
      3,
      this.dataNav,
      this.allData,
      this.translateService
    );
    displayItemEvaluation(3, 3, this.allData, this.translateService);

    // SECTION 3 - SUBSECTION 4 - "DATA DISAPPEARENCE"
    doc.addPage();
    pageSize = 40;
    generateHeader('#df4664', this.dataNav, 2, 3, this.translateService);
    displayQuestions(
      2,
      3,
      3,
      4,
      this.dataNav,
      this.allData,
      this.translateService
    );
    displayItemEvaluation(3, 4, this.allData, this.translateService);

    // SECTION 3 - SUBSECTION 5 - "RISKS OVERVIEW"
    doc.addPage();
    pageSize = 40;
    generateHeader('#df4664', this.dataNav, 2, 4, this.translateService);
    // TODO : graph

    // SECTION 4 - "VALIDATION"

    // SECTION 4 - SUBSECTION 1 - "RISK MAPPING"
    doc.addPage();
    pageSize = 40;
    generateHeader('#121921', this.dataNav, 3, 0, this.translateService);
    // TODO : graph

    // SECTION 4 - SUBSECTION 2 - "ACTION PLAN"
    doc.addPage();
    pageSize = 40;
    generateHeader('#121921', this.dataNav, 3, 1, this.translateService);
    // TODO : action plan + graph

    // SECTION 4 - SUBSECTION 3 - "DPO AND DATA SUBECTS' OPINIONS"
    doc.addPage();
    pageSize = 40;
    generateHeader('#121921', this.dataNav, 3, 2, this.translateService);
    // TODO

    // Saving .pdf file
    doc.save('pia-' + slugify(this.pia.name) + '.pdf');
  }

  /**
   * Get information from the JSON file.
   * @returns {Promise}
   * @private
   */
  private async getJsonInfo(): Promise<void> {
    this.allData = {};
    this.piaService.data.sections.forEach(async section => {
      this.allData[section.id] = {};
      section.items.forEach(async item => {
        this.allData[section.id][item.id] = {};
        const ref = section.id.toString() + '.' + item.id.toString();

        // Measure
        if (item.is_measure) {
          this.allData[section.id][item.id] = [];
          this.measureService.pia_id = this.pia.id;
          const entries: any = await this.measureService.findAllByPia(
            this.pia.id
          );
          entries.forEach(async measure => {
            /* Completed measures */
            if (measure.title !== undefined && measure.content !== undefined) {
              let evaluation = null;
              if (item.evaluation_mode === 'question') {
                evaluation = await this.getEvaluation(
                  section.id,
                  item.id,
                  ref + '.' + measure.id
                );
              }
              this.allData[section.id][item.id].push({
                title: measure.title,
                content: measure.content,
                evaluation
              });
            }
          });
        } else if (item.questions) {
          // Question
          item.questions.forEach(async question => {
            this.allData[section.id][item.id][question.id] = {};
            this.answerService
              .getByReferenceAndPia(this.pia.id, question.id)
              .then((answer: Answer) => {
                /* An answer exists */
                if (answer && answer.data) {
                  const content = [];
                  if (answer.data.gauge && answer.data.gauge > 0) {
                    content.push(
                      this.translateService.instant(
                        this.piaService.getGaugeName(answer.data.gauge)
                      )
                    );
                  }
                  if (answer.data.text && answer.data.text.length > 0) {
                    content.push(answer.data.text);
                  }
                  if (answer.data.list && answer.data.list.length > 0) {
                    content.push(answer.data.list.join(', '));
                  }
                  if (content.length > 0) {
                    if (item.evaluation_mode === 'question') {
                      this.getEvaluation(
                        section.id,
                        item.id,
                        ref + '.' + question.id
                      ).then(evaluation => {
                        this.allData[section.id][item.id][
                          question.id
                        ].evaluation = evaluation;
                      });
                    }
                    this.allData[section.id][item.id][
                      question.id
                    ].content = content.join(', ');
                  }
                }
              });
          });
        }
        if (item.evaluation_mode === 'item') {
          const evaluation = await this.getEvaluation(section.id, item.id, ref);
          this.allData[section.id][item.id]['evaluation_item'] = evaluation;
        }
      });
    });
  }

  /**
   * Get an evaluation by reference.
   * @private
   * @param {string} section_id - The section id.
   * @param {string} item_id - The item id.
   * @param {string} ref - The reference.
   * @returns {Promise}
   */
  private async getEvaluation(
    section_id: string,
    item_id: string,
    ref: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;
      this.evaluationService
        .getByReference(this.pia.id, ref)
        .then((exist: Evaluation) => {
          if (exist) {
            evaluation = {
              title: this.evaluationService.getStatusName(exist.status),
              action_plan_comment: exist.action_plan_comment,
              evaluation_comment: exist.evaluation_comment,
              gauges: {
                riskName: {
                  value: this.translateService.instant(
                    'sections.' + section_id + '.items.' + item_id + '.title'
                  )
                },
                seriousness: exist.gauges ? exist.gauges.x : null,
                likelihood: exist.gauges ? exist.gauges.y : null
              }
            };
          }
          resolve(evaluation);
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  getUsersList(type: string, dump_field: string = null): string {
    if (this.authService.state) {
      return this.pia.user_pias
        .filter(up => up.role === type)
        .map(x =>
          x.user.firstname
            ? x.user.firstname + ' ' + x.user.lastname
            : x.user.email
        )
        .join(',');
    } else if (dump_field) {
      return this.pia[dump_field];
    }
  }
}
