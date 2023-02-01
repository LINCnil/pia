import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import { svgAsPngUri } from 'save-svg-as-png';
import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AttachmentsService } from 'src/app/services/attachments.service';
import * as html2pdf from 'html2pdf.js';

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

  constructor(
    private piaService: PiaService,
    private actionPlanService: ActionPlanService,
    private translateService: TranslateService,
    private appDataService: AppDataService,
    public attachmentsService: AttachmentsService
  ) {}

  ngOnInit(): void {
    this.dataNav = this.appDataService.dataNav;

    // prepare for export
    this.prepareCsv();
    this.piaService.export(this.pia.id).then((json: any) => {
      this.piaJson = json;
    });

    if (this.pia.is_archive === 1) {
      this.fromArchives = true;
    }
  }

  /****************************** DOWNLOAD FILES ************************************/
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
    if (this.editMode) {
      this.downloading.emit(true);
      setTimeout(async () => {
        this.onDownload().then(() => {
          setTimeout(async () => {
            this.downloading.emit(false);
          }, 2000);
        });
      }, 2000);
    } else {
      this.onDownload();
    }
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
  /****************************** END DOWNLOAD FILES *********************************/

  /****************************** CREATE EXPORTS ************************************/

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

  /****************************** CSV EXPORT ************************************/
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
  /****************************** END CSV EXPORT *********************************/

  /****************************** DOC EXPORT ************************************/
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
  /****************************** END DOC EXPORT ********************************/

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

  async generatePdf(autosave = false) {
    return new Promise(async (resolve, reject) => {
      const content = document.createElement('page');
      const opt = {
        margin: 10,
        filename: `${this.pia.name}.pdf`,
        pagebreak: {
          before: '.pagebreak',
          mode: ['css', 'avoid-all']
        }
      };

      // Header
      let header = document.querySelector(
        'header.pia-fullPreviewBlock-header .pia-fullPreviewBlock-header-title'
      );

      if (header) {
        header = header.cloneNode(true) as HTMLElement;
        header.setAttribute('with', '100%');
        const headerTitle = header.querySelector('h1');
        if (headerTitle) {
          headerTitle.innerText = this.pia.name;
          headerTitle.setAttribute('font-size', '3rem');
          headerTitle.setAttribute('margin', '0px');
        }
        content.appendChild(header);
      }

      // SECTION 1, 2, 3
      const sections = document.querySelectorAll('.section-preview');
      sections.forEach(section => {
        let el = section.cloneNode(true) as HTMLElement;
        el.setAttribute('width', '100%');
        if (el.querySelector('.pagebreak').hasChildNodes()) {
          content.appendChild(el);
        }
      });

      // DPO
      let dpo = document.querySelector('.section-dpo');
      if (dpo) {
        dpo = dpo.cloneNode(true) as HTMLElement;
        dpo.setAttribute('width', '100%');
        content.appendChild(dpo);
      }

      // ACTION PLAN
      let action = document.querySelector('.section-action-plan');
      if (action) {
        action = action.cloneNode(true) as HTMLElement;
        action.setAttribute('width', '100%');
        content.appendChild(action);
      }

      // SCHEMA SECTIONS
      Promise.all([
        this.getRisksCartographyImg(),
        this.getRisksOverviewImgForZip()
      ]).then(values => {
        //
        let risks = document.querySelector('.section-risks-cartography');
        if (risks) {
          risks = risks.cloneNode(true) as HTMLElement;
          const img = document.createElement('img');
          img.src = values[0];

          let shemContCartography = risks.querySelector('#risksCartographyImg');
          shemContCartography.innerHTML = '';
          shemContCartography.append(img);
          risks.setAttribute('width', '100%');
          content.append(risks);
        }

        let overview = document.querySelector('.section-overview');
        if (overview) {
          overview = overview.cloneNode(true) as HTMLElement;
          const img = document.querySelector('img');
          img.src = values[1];

          let shemContRisksOverview = overview.querySelector('.risksOverview');
          shemContRisksOverview.innerHTML = '';
          shemContRisksOverview.append(img);
          overview.setAttribute('width', '100%');
          content.appendChild(overview);
        }

        const pagebreaks = content.querySelectorAll('.pagebreak');
        pagebreaks.forEach(pb => {
          pb.setAttribute('padding-top', '35px');
        });

        // MAKE PDF !
        const worker = html2pdf()
          .from(content)
          .set(opt)
          .toPdf()
          .get('pdf')
          .outputPdf()
          .then(pdf => {
            // This logs the right base64
            resolve(pdf);
          });

        if (autosave) {
          worker.save();
        }
      });
    });
  }
  /****************************** END CREATE EXPORTS *********************************/
}
