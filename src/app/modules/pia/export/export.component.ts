import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import { svgAsPngUri } from 'save-svg-as-png';
import { jsPDF } from 'jspdf';

import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Pia } from 'src/app/models/pia.model';

import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { AuthService } from 'src/app/services/auth.service';
import { MeasureService } from 'src/app/services/measures.service';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { AnswerService } from 'src/app/services/answer.service';
import { LanguagesService } from 'src/app/services/languages.service';

declare const require: any;
require('src/assets/fonts/Roboto-Regular-webfont-normal.js');
require('src/assets/fonts/Roboto-Bold-webfont-bold.js');
require('src/assets/fonts/GFSNeohellenic-Regular-normal.js');
require('src/assets/fonts/GFSNeohellenic-Bold-bold.js');
require('src/assets/fonts/Cousine-Regular-normal.js');
require('src/assets/fonts/Cousine-Bold-bold.js');

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
    private route: ActivatedRoute,
    private piaService: PiaService,
    private actionPlanService: ActionPlanService,
    private translateService: TranslateService,
    private appDataService: AppDataService,
    public attachmentsService: AttachmentsService,
    private measureService: MeasureService,
    public authService: AuthService,
    private answerService: AnswerService,
    private evaluationService: EvaluationService,
    public languagesService: LanguagesService
  ) {}

  ngOnInit(): void {
    this.piaService
      .find(parseInt(this.route.snapshot.params.id))
      .then((pia: Pia) => {
        this.pia = pia;
        this.piaService.calculPiaProgress(this.pia);
        this.dataNav = this.appDataService.dataNav;
        this.getJsonInfo();
        this.prepareCsv();
        this.piaService.export(this.pia.id).then((json: any) => {
          this.piaJson = json;
        });
        if (this.pia.is_archive === 1) {
          this.fromArchives = true;
        }
      });
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
    window.scroll(0, 0);
    this.downloading.emit(true);
    setTimeout(async () => {
      window.scroll(0, 0);
      this.onDownload().then(() => {
        this.downloading.emit(false);
      });
    }, 5000);
  }

  async onDownload(): Promise<void> {
    window.scroll(0, 0);
    return new Promise((resolve, reject) => {
      if (this.exportSelected) {
        if (this.exportSelected.length > 1) {
          // download by selection
          window.scroll(0, 0);
          this.generateExportsZip('pia-full-content', this.exportSelected).then(
            () => {
              resolve();
            }
          );
        } else {
          // download only one element
          const fileTitle = 'pia-' + slugify(this.pia.name);
          const navigator: any = window.navigator;
          switch (this.exportSelected[0]) {
            // .pdf
            case 'pdf':
              window.scroll(0, 0);
              this.generatePdf(true).then(() => {
                resolve();
              });
              break;

            // .doc
            case 'doc':
              window.scroll(0, 0);
              this.generateDoc('pia-full-content').then(() => {
                resolve();
              });
              break;

            // Images
            case 'images':
              window.scroll(0, 0);
              this.downloadAllGraphsAsImages().then(() => {
                resolve();
              });
              break;

            // .json
            case 'json':
              window.scroll(0, 0);
              this.piaService.export(this.pia.id).then((json: any) => {
                const downloadLink = document.createElement('a');
                document.body.appendChild(downloadLink);
                if (navigator.msSaveOrOpenBlob) {
                  navigator.msSaveBlob(json, fileTitle + '.json');
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

            // .csv
            case 'csv':
              window.scroll(0, 0);
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
                navigator.msSaveBlob(blob, csvName);
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
   * Generate a ZIP with the pdf + doc + csv + json + all pictures
   * @param element block in the HTML view used to generate the docx in the zip
   * @param exports files to exports array ['pdf', 'doc', 'images', 'csv', 'json']
   */
  async generateExportsZip(element, exports: Array<string>): Promise<void> {
    window.scroll(0, 0);
    const zipName = 'pia-' + slugify(this.pia.name) + '.zip';
    const JSZip = require('jszip');
    const zip = new JSZip();

    // Attach export files
    await this.addAttachmentsToZip(zip).then(async (zip2: any) => {
      // .pdf
      if (exports.includes('pdf')) {
        window.scroll(0, 0);
        const pdf = await this.generatePdf();
        const blob = new Blob([pdf], { type: 'application/pdf' });
        zip.file('pia-' + slugify(this.pia.name) + '.pdf', blob, {
          binary: true
        });
      }

      // .doc
      if (exports.includes('doc')) {
        window.scroll(0, 0);
        const dataDoc = await this.prepareDocFile(element);
        zip2.file('Doc/' + dataDoc.filename, dataDoc.blob);
      }

      // .json
      if (exports.includes('json')) {
        window.scroll(0, 0);
        zip2.file('pia-' + slugify(this.pia.name) + '.json', this.piaJson, {
          binary: true
        });
      }

      // .csv
      if (exports.includes('csv')) {
        window.scroll(0, 0);
        const fileTitle = this.translateService.instant(
          'summary.action_plan.title'
        );
        const blob = this.csvToBlob(fileTitle);
        zip2.file('CSV/' + slugify(fileTitle) + '.csv', blob, { binary: true });
      }

      // Images
      if (exports.includes('images')) {
        window.scroll(0, 0);
        await this.addImagesToZip(zip2).then(async (zip3: any) => {
          await zip3.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, zipName);
          });
        });
      } else {
        window.scroll(0, 0);
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
        const navigator: any = window.navigator;
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
    window.scroll(0, 0);
    return new Promise(async (resolve, reject) => {
      this.attachmentsService
        .findAllByPia(this.pia.id)
        .then((attachments: Array<any>) => {
          attachments.forEach(attachment => {
            if (attachment.file && attachment.file.length > 0) {
              window.scroll(0, 0);
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
    window.scroll(0, 0);
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
    window.scroll(0, 0);
    return new Promise(async (resolve, reject) => {
      window.scroll(0, 0);
      const actionPlanOverviewImg = await this.getActionPlanOverviewImg();
      window.scroll(0, 0);
      const risksCartographyImg = await this.getRisksCartographyImg();
      window.scroll(0, 0);
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
        window.scroll(0, 0);
        const actionPlanOverviewImg = document.querySelector(
          '#actionPlanOverviewImg'
        );
        if (actionPlanOverviewImg) {
          html2canvas(actionPlanOverviewImg as HTMLElement, { scale: 4 }).then(
            canvas => {
              if (canvas) {
                const img = canvas.toDataURL();
                resolve(img);
              }
            }
          );
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
        window.scroll(0, 0);
        const risksCartographyImg = document.querySelector(
          '#risksCartographyImg'
        );
        if (risksCartographyImg) {
          html2canvas(risksCartographyImg as HTMLElement, { scale: 4 }).then(
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
  async getRisksOverviewImgForZip(): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        window.scroll(0, 0);
        const mysvg = document.getElementById('risksOverviewSvg');
        if (mysvg) {
          svgAsPngUri(mysvg, {}, uri => {
            resolve(uri);
          });
        }
      }, 250);
    });
  }

  /**
   * Generate a .pdf document for the PIA report.
   * @param autosave
   */
  async generatePdf(autosave = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
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

      // Allow to insert text
      function writeBoldText(
        content,
        x,
        y,
        fontSize = 12,
        lineSpacing = 12,
        languagesService
      ) {
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
            // Note: we might have to do it for arabic language later, if it's integrated
            if (languagesService.selectedLanguage === 'el') {
              if (i % 2 === 0) {
                doc.setFont('GFSNeohellenic-Regular', 'normal');
              } else {
                doc.setFont('GFSNeohellenic-Bold', 'bold');
              }
            } else if (languagesService.selectedLanguage === 'bg') {
              if (i % 2 === 0) {
                doc.setFont('Cousine-Regular', 'normal');
              } else {
                doc.setFont('Cousine-Bold', 'bold');
              }
            } else {
              if (i % 2 === 0) {
                doc.setFont('Roboto-Regular-webfont', 'normal');
              } else {
                doc.setFont('Roboto-Bold-webfont', 'bold');
              }
            }
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
        const htmlRegexStrong = /<strong>/g;
        const htmlRegexStrong2 = /<\/strong>/g;
        string = string.replace(htmlRegexStrong, ' **');
        string = string.replace(htmlRegexStrong2, '**');
        const htmlRegexAnd = /&amp;/g;
        string = string.replace(htmlRegexAnd, '&');
        const htmlRegexLi = /<li>/g;
        string = string.replace(htmlRegexLi, '- ');
        const htmlRegexBr = /<br \/>/g;
        string = string.replace(htmlRegexBr, '\r\n');
        const htmlRegexBr2 = /<br>/g;
        string = string.replace(htmlRegexBr2, '\r\n');
        const htmlRegex = /<span class='green-highlight'>/g;
        string = string.replace(htmlRegex, '');
        const htmlRegex2 = /<span class='red-highlight'>/g;
        string = string.replace(htmlRegex2, '');
        const htmlRegex3 = /<span class='strong'>/g;
        string = string.replace(htmlRegex3, '');
        const htmlRegexFinal = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
        string = string.replace(htmlRegexFinal, '');
        return string;
      }

      // Display DPO data
      function displayDpoData(
        translateService,
        pia,
        piaService,
        languagesService
      ) {
        if (pia.dpos_names && pia.dpos_names.length > 0) {
          pageSize += 20;
          writeBoldText(
            purifyString(`**${translateService.instant('summary.dpo_name')}**`),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(pia.dpos_names),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
        }
        if (pia.dpo_status && pia.dpo_status > 0) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant('summary.dpo_status')}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(
              translateService.instant(
                piaService.getOpinionsStatus(pia.dpo_status.toString())
              )
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
        }
        if (pia.dpo_opinion && pia.dpo_opinion.length > 0) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant('summary.dpo_opinion')}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(pia.dpo_opinion),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
        }

        // Searched opinion for concerned people
        if (pia.concerned_people_searched_opinion === true) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant(
                'summary.concerned_people_searched_opinion'
              )}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(
              translateService.instant(
                piaService.getPeopleSearchStatus(
                  pia.concerned_people_searched_opinion
                )
              )
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          if (pia.people_names && pia.people_names.length > 0) {
            pageSize += 20;
            writeBoldText(
              purifyString(
                `**${translateService.instant(
                  'summary.concerned_people_name'
                )}**`
              ),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
            writeBoldText(
              purifyString(pia.people_names),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
          }
          if (pia.concerned_people_status >= 0) {
            pageSize += 20;
            writeBoldText(
              purifyString(
                `**${translateService.instant(
                  'summary.concerned_people_status'
                )}**`
              ),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
            writeBoldText(
              purifyString(
                translateService.instant(
                  piaService.getOpinionsStatus(
                    pia.concerned_people_status.toString()
                  )
                )
              ),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
          }
          if (
            pia.concerned_people_opinion &&
            pia.concerned_people_opinion.length > 0
          ) {
            pageSize += 20;
            writeBoldText(
              purifyString(
                `**${translateService.instant(
                  'summary.concerned_people_opinion'
                )}**`
              ),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
            writeBoldText(
              purifyString(pia.concerned_people_opinion),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
          }
        }

        // Unsearched opinion for concerned people
        if (pia.concerned_people_searched_opinion === false) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant(
                'summary.concerned_people_searched_opinion'
              )}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(
              translateService.instant(
                piaService.getPeopleSearchStatus(
                  pia.concerned_people_searched_opinion
                )
              )
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          if (
            pia.concerned_people_searched_content &&
            pia.concerned_people_searched_content.length > 0
          ) {
            pageSize += 20;
            writeBoldText(
              purifyString(
                `**${translateService.instant(
                  'summary.concerned_people_unsearched_opinion_comment'
                )}**`
              ),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
            writeBoldText(
              purifyString(pia.concerned_people_searched_content),
              20,
              testPdfSize(pageSize),
              12,
              15,
              languagesService
            );
          }
        }

        if (pia.applied_adjustments && pia.applied_adjustments.length > 0) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant('summary.modification_made')}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(pia.applied_adjustments),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
        }
        if (pia.rejection_reason && pia.rejection_reason.length > 0) {
          pageSize += 20;
          writeBoldText(
            purifyString(
              `**${translateService.instant('summary.rejection_reason')}**`
            ),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
          writeBoldText(
            purifyString(pia.rejection_reason),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );
        }
      }

      // Display questions for a specific section and item
      function displayQuestions(
        dataNavSectionId,
        dataNavItemId,
        allDataSectionId,
        allDataItemId,
        dataNav,
        allData,
        translateService,
        languagesService
      ) {
        for (const question of dataNav['sections'][dataNavSectionId]['items'][
          dataNavItemId
        ]['questions']) {
          // Question title
          doc.setTextColor('#091c6B');
          writeBoldText(
            purifyString(translateService.instant(question.title)),
            20,
            testPdfSize(pageSize),
            12,
            15,
            languagesService
          );

          // Question answer
          doc.setTextColor('#000');
          const questionAnswer =
            allData[allDataSectionId][allDataItemId][question.id].content;
          if (questionAnswer) {
            writeBoldText(
              purifyString(questionAnswer),
              20,
              testPdfSize(pageSize),
              10,
              12,
              languagesService
            );
          }

          // Question evaluation (if any)
          if (
            allData[allDataSectionId][allDataItemId][question.id].evaluation
          ) {
            pageSize += 20;
            doc.setDrawColor('#aaa');
            doc.line(20, pageSize - 20, pageWidth - 20, pageSize - 20);

            // Question evaluation value
            const questionEvaluationTitle = `**${translateService.instant(
              'evaluations.title'
            )}** : ${translateService.instant(
              allData[allDataSectionId][allDataItemId][question.id].evaluation
                .title
            )}`;
            if (questionEvaluationTitle) {
              writeBoldText(
                purifyString(questionEvaluationTitle),
                20,
                testPdfSize(pageSize),
                10,
                12,
                languagesService
              );
            }

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
              if (questionEvaluationActionPlanComment) {
                writeBoldText(
                  purifyString(questionEvaluationActionPlanComment),
                  20,
                  testPdfSize(pageSize),
                  10,
                  12,
                  languagesService
                );
              }
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
              if (questionEvaluationComment) {
                writeBoldText(
                  purifyString(questionEvaluationComment),
                  20,
                  testPdfSize(pageSize),
                  10,
                  12,
                  languagesService
                );
              }
            }
          }

          pageSize += 10;
        }
      }

      // Display measures for a specific section and item
      function displayMeasures(allData, translateService, languagesService) {
        if (allData[3][1] && allData[3][1].length > 0) {
          for (const measure of allData[3][1]) {
            // Measure title
            doc.setTextColor('#091c6B');
            if (measure.title) {
              writeBoldText(
                purifyString(measure.title),
                20,
                testPdfSize(pageSize),
                12,
                15,
                languagesService
              );
            }

            // Measure content
            doc.setTextColor('#000');
            if (measure.content) {
              writeBoldText(
                purifyString(measure.content),
                20,
                testPdfSize(pageSize),
                10,
                12,
                languagesService
              );
            }

            // Measure evaluation (if any)
            if (measure.evaluation) {
              pageSize += 20;
              doc.setDrawColor('#aaa');
              doc.line(20, pageSize - 20, pageWidth - 20, pageSize - 20);

              // Measure evaluation value
              const measureEvaluationTitle = `**${translateService.instant(
                'evaluations.title'
              )}** : ${translateService.instant(measure.evaluation.title)}`;
              if (measureEvaluationTitle) {
                writeBoldText(
                  purifyString(measureEvaluationTitle),
                  20,
                  testPdfSize(pageSize),
                  10,
                  12,
                  languagesService
                );
              }

              // Measure evaluation action plan comment
              if (measure.evaluation.action_plan_comment) {
                const measureEvaluationActionPlanComment = `**${translateService.instant(
                  'evaluations.action_plan_comment'
                )}** : ${measure.evaluation.action_plan_comment}`;
                if (measureEvaluationActionPlanComment) {
                  writeBoldText(
                    purifyString(measureEvaluationActionPlanComment),
                    20,
                    testPdfSize(pageSize),
                    10,
                    12,
                    languagesService
                  );
                }
              }

              // Measure evaluation comment
              if (measure.evaluation.evaluation_comment) {
                const measureEvaluationComment = `**${translateService.instant(
                  'evaluations.evaluation_comment'
                )}** : ${measure.evaluation.evaluation_comment}`;
                if (measureEvaluationComment) {
                  writeBoldText(
                    purifyString(measureEvaluationComment),
                    20,
                    testPdfSize(pageSize),
                    10,
                    12,
                    languagesService
                  );
                }
              }
            }

            pageSize += 10;
          }
        }
      }

      // Display the global evaluation for a specific item (if any)
      function displayItemEvaluation(
        allDataSectionId,
        allDataItemId,
        allData,
        translateService,
        languagesService
      ) {
        if (allData[allDataSectionId][allDataItemId]['evaluation_item']) {
          pageSize += 10;
          doc.setDrawColor('#aaa');
          doc.line(20, pageSize - 20, pageWidth - 20, pageSize - 20);

          // Evaluation value
          const evaluationTitle = `**${translateService.instant(
            'evaluations.title'
          )}** : ${translateService.instant(
            allData[allDataSectionId][allDataItemId]['evaluation_item'].title
          )}`;
          if (evaluationTitle) {
            writeBoldText(
              purifyString(evaluationTitle),
              20,
              testPdfSize(pageSize),
              10,
              12,
              languagesService
            );
          }

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
            if (evaluationActionPlanComment) {
              writeBoldText(
                purifyString(evaluationActionPlanComment),
                20,
                testPdfSize(pageSize),
                10,
                12,
                languagesService
              );
            }
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
            if (evaluationComment) {
              writeBoldText(
                purifyString(evaluationComment),
                20,
                testPdfSize(pageSize),
                10,
                12,
                languagesService
              );
            }
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
              if (evaluationGaugeSeriousness) {
                writeBoldText(
                  purifyString(evaluationGaugeSeriousness),
                  20,
                  testPdfSize(pageSize),
                  10,
                  12,
                  languagesService
                );
              }
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
              if (evaluationGaugeLikelihood) {
                writeBoldText(
                  purifyString(evaluationGaugeLikelihood),
                  20,
                  testPdfSize(pageSize),
                  10,
                  12,
                  languagesService
                );
              }
            }
          }

          pageSize += 10;
        }
      }

      // Generate the header of a specific section and item
      function generateHeader(
        color,
        dataNav,
        dataNavSectionId,
        dataNavItemId,
        translateService,
        languagesService
      ) {
        doc.setFillColor(color);
        doc.rect(20, 20, 74, 50, 'F');
        doc.setDrawColor('#aaa');
        doc.rect(20, 20, pageWidth - 40, 50);
        writeBoldText(
          purifyString(
            translateService.instant(
              dataNav['sections'][dataNavSectionId].title
            )
          ),
          105,
          testPdfSize(pageSize),
          16,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(
              dataNav['sections'][dataNavSectionId]['items'][dataNavItemId]
                .title
            )
          ),
          105,
          testPdfSize(pageSize),
          14,
          40,
          languagesService
        );
      }

      // Generate the summary of the PIA
      function generateSummary(dataNav, translateService, languagesService) {
        // Section 1
        doc.setFillColor('#3ee095');
        doc.rect(20, 20, 8, 30, 'F');
        doc.setDrawColor('#aaa');
        doc.rect(20, 20, pageWidth - 40, 30);
        writeBoldText(
          purifyString(translateService.instant(dataNav['sections'][0].title)),
          35,
          testPdfSize(pageSize),
          16,
          30,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][0]['items'][0].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][0]['items'][1].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          50,
          languagesService
        );
        // Section 2
        doc.setFillColor('#091c6b');
        doc.rect(20, 120, 8, 30, 'F');
        doc.setDrawColor('#aaa');
        doc.rect(20, 120, pageWidth - 40, 30);
        writeBoldText(
          purifyString(translateService.instant(dataNav['sections'][1].title)),
          35,
          testPdfSize(pageSize),
          16,
          30,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][1]['items'][0].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][1]['items'][1].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          50,
          languagesService
        );
        // Section 3
        doc.setFillColor('#df4664');
        doc.rect(20, 220, 8, 30, 'F');
        doc.setDrawColor('#aaa');
        doc.rect(20, 220, pageWidth - 40, 30);
        writeBoldText(
          purifyString(translateService.instant(dataNav['sections'][2].title)),
          35,
          testPdfSize(pageSize),
          16,
          30,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][2]['items'][0].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][2]['items'][1].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][2]['items'][2].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][2]['items'][3].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][2]['items'][4].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          50,
          languagesService
        );
        // Section 4
        doc.setFillColor('#121921');
        doc.rect(20, 380, 8, 30, 'F');
        doc.setDrawColor('#aaa');
        doc.rect(20, 380, pageWidth - 40, 30);
        writeBoldText(
          purifyString(translateService.instant(dataNav['sections'][3].title)),
          35,
          testPdfSize(pageSize),
          16,
          30,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][3]['items'][0].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][3]['items'][1].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          20,
          languagesService
        );
        writeBoldText(
          purifyString(
            translateService.instant(dataNav['sections'][3]['items'][2].title)
          ),
          20,
          testPdfSize(pageSize),
          12,
          50,
          languagesService
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
        20,
        this.languagesService
      );
      writeBoldText(
        this.pia.name,
        105,
        testPdfSize(pageSize),
        14,
        40,
        this.languagesService
      );

      const piaAuthor = `**${this.translateService.instant(
        'summary.preview_edition'
      )}** : ${this.getUsersList('author', 'author_name')}`;
      writeBoldText(
        piaAuthor,
        20,
        testPdfSize(pageSize),
        12,
        20,
        this.languagesService
      );
      const piaEvaluator = `**${this.translateService.instant(
        'summary.preview_evaluation'
      )}** : ${this.getUsersList('evaluator', 'evaluator_name')}`;
      writeBoldText(
        piaEvaluator,
        20,
        testPdfSize(pageSize),
        12,
        20,
        this.languagesService
      );
      const piaValidator = `**${this.translateService.instant(
        'summary.preview_validation'
      )}** : ${this.getUsersList('validator', 'validator_name')}`;
      writeBoldText(
        piaValidator,
        20,
        testPdfSize(pageSize),
        12,
        20,
        this.languagesService
      );
      if (this.authService.state) {
        const piaGuests = `**${this.translateService.instant(
          'summary.preview_guests'
        )}** : ${this.getUsersList('guest')}`;
        writeBoldText(
          piaGuests,
          20,
          testPdfSize(pageSize),
          12,
          20,
          this.languagesService
        );
      }
      const piaStatusAndProgress = `**${this.translateService.instant(
        'summary.preview_status'
      )}** : ${this.translateService.instant(
        this.piaService.getStatusName(this.pia.status)
      )} (${this.pia.progress}%)`;
      writeBoldText(
        piaStatusAndProgress,
        20,
        testPdfSize(pageSize),
        12,
        20,
        this.languagesService
      );

      // SUMMARY
      doc.addPage();
      pageSize = 40;
      generateSummary(
        this.dataNav,
        this.translateService,
        this.languagesService
      );

      // SECTION 1 - "CONTEXT"

      // SECTION 1 - SUBSECTION 1 - "OVERVIEW"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#3ee095',
        this.dataNav,
        0,
        0,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        0,
        0,
        1,
        1,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );
      displayItemEvaluation(
        1,
        1,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 1 - SUBSECTION 2 - "DATA, PROCESSES AND SUPPORTING ASSETS"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#3ee095',
        this.dataNav,
        0,
        1,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        0,
        1,
        1,
        2,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );
      displayItemEvaluation(
        1,
        2,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 2 - "FUNDAMENTAL PRINCIPLES"

      // SECTION 2 - SUBSECTION 1 - "PROPORTIONALITY AND NECESSITY"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#091c6b',
        this.dataNav,
        1,
        0,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        1,
        0,
        2,
        1,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 2 - SUBSECTION 2 - "CONTROLS TO PROTECT THE PERSONAL RIGHTS OF DATA SUBJECTS"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#091c6b',
        this.dataNav,
        1,
        1,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        1,
        1,
        2,
        2,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 3 - "RISKS"

      // SECTION 3 - SUBSECTION 1 - "PLANNED OR EXISTING MEASURES"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#df4664',
        this.dataNav,
        2,
        0,
        this.translateService,
        this.languagesService
      );
      displayMeasures(
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 3 - SUBSECTION 2 - "ILLEGITIMATE ACCESS TO DATA"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#df4664',
        this.dataNav,
        2,
        1,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        2,
        1,
        3,
        2,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );
      displayItemEvaluation(
        3,
        2,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 3 - SUBSECTION 3 - "UNWANTED MODIFICATION OF DATA"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#df4664',
        this.dataNav,
        2,
        2,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        2,
        2,
        3,
        3,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );
      displayItemEvaluation(
        3,
        3,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 3 - SUBSECTION 4 - "DATA DISAPPEARENCE"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#df4664',
        this.dataNav,
        2,
        3,
        this.translateService,
        this.languagesService
      );
      displayQuestions(
        2,
        3,
        3,
        4,
        this.dataNav,
        this.allData,
        this.translateService,
        this.languagesService
      );
      displayItemEvaluation(
        3,
        4,
        this.allData,
        this.translateService,
        this.languagesService
      );

      // SECTION 3 - SUBSECTION 5 - "RISKS OVERVIEW"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#df4664',
        this.dataNav,
        2,
        4,
        this.translateService,
        this.languagesService
      );
      window.scroll(0, 0);
      await this.getRisksOverviewImgForZip().then(data => {
        doc.addImage(data, 'PNG', 10, 75, 480, 580);
      });

      // SECTION 4 - "VALIDATION"

      // SECTION 4 - SUBSECTION 1 - "RISK MAPPING"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#121921',
        this.dataNav,
        3,
        0,
        this.translateService,
        this.languagesService
      );
      window.scroll(0, 0);
      await this.getRisksCartographyImg().then(data => {
        doc.addImage(data, 'PNG', 10, 75, 480, 480);
      });

      // SECTION 4 - SUBSECTION 2 - "ACTION PLAN"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#121921',
        this.dataNav,
        3,
        1,
        this.translateService,
        this.languagesService
      );
      window.scroll(0, 0);
      await this.getActionPlanOverviewImg().then(data => {
        doc.addImage(data, 'PNG', 10, 75, 480, 550);
      });
      // Action plan

      // SECTION 4 - SUBSECTION 3 - "DPO AND DATA SUBECTS' OPINIONS"
      doc.addPage();
      pageSize = 40;
      generateHeader(
        '#121921',
        this.dataNav,
        3,
        2,
        this.translateService,
        this.languagesService
      );
      displayDpoData(
        this.translateService,
        this.pia,
        this.piaService,
        this.languagesService
      );

      // Saving .pdf file
      if (autosave) {
        doc.save('pia-' + slugify(this.pia.name) + '.pdf');
      }

      // This returns the doc that should be converted to base64 (useful for the .zip feature)
      resolve(doc.output('blob'));
    });
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
      const foundUsers = this.pia.user_pias
        .filter(up => up.role === type)
        .map(x =>
          x.user.firstname
            ? x.user.firstname + ' ' + x.user.lastname
            : x.user.email
        )
        .join(', ');
      if (foundUsers) {
        return foundUsers;
      } else {
        if (dump_field) {
          return this.pia[dump_field];
        } else {
          return ' / ';
        }
      }
    } else if (dump_field) {
      return this.pia[dump_field];
    }
  }
}
