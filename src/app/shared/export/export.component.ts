import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as html2canvas from 'html2canvas';
import { saveSvgAsPng, svgAsPngUri } from 'save-svg-as-png';
import { PiaService } from 'src/app/services/pia.service';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { ActionPlanService } from 'src/app/entry/entry-content/action-plan/action-plan.service';
import { TranslateService } from '@ngx-translate/core';
declare const require: any;

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}


@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  pia: any;
  csvContent: any;
  fromArchives = false;
  dataNav: any;
  csvOptions = {};
  exportSelected: Array<any> = [];
  piaJson: JSON;
  @Output() downloading = new EventEmitter();
  @Input() editMode = false;

  constructor(
    public _piaService: PiaService,
    public _actionPlanService: ActionPlanService,
    private _translateService: TranslateService,
    private _appDataService: AppDataService,
    public _attachmentsService: AttachmentsService) { }

  ngOnInit() {
    this.dataNav = this._appDataService.dataNav;

    this._piaService.getPIA().then(() => {
      this.pia = this._piaService.pia;
      this._piaService.calculPiaProgress(this.pia);

      // prepare for export
      this.prepareCsv();
      this._piaService.export(this.pia.id).then((json: any) => {
        this.piaJson = json;
      });

      this._attachmentsService.pia = this.pia;
      this._attachmentsService.listAttachments();

      if (this.pia.is_archive === 1) {
        this.fromArchives = true;
      }
    });
  }

  /****************************** DOWNLOAD FILES ************************************/
    onSelectDownload(type:string, isChecked: boolean) {
      if (isChecked) {
        this.exportSelected.push(type);
      } else {
        let index = this.exportSelected.indexOf(type);
        this.exportSelected.splice(index, 1);
      }
    }

    async launchDownload() {
      if (this.editMode) {
        this.downloading.emit(true);
        setTimeout(async () => {
          await this.onDownload().then(() => {
            this.downloading.emit(false);
          });
        }, 5000);
      } else {
        this.onDownload();
      }
    }

    async onDownload() {
      if (this.exportSelected) {
        if (this.exportSelected.length > 1) { // download by selection
          await this.generateExportsZip('pia-full-content', this.exportSelected);
        } else { // download only one element
          const fileTitle = 'pia-' + slugify(this.pia.name);
          switch (this.exportSelected[0]) {
            case 'doc': // Only doc
              await this.generateDocx('pia-full-content');
              break;
            case 'images': // Only images
              await this.downloadAllGraphsAsImages();
              break;
            case 'json': // Only json
              this._piaService.export(this.pia.id).then((json: any) => {
                let downloadLink = document.createElement('a');
                document.body.appendChild(downloadLink);
                if (navigator.msSaveOrOpenBlob) {
                  window.navigator.msSaveBlob(json, fileTitle + '.json');
                } else {
                  downloadLink.href = json;
                  downloadLink.download = fileTitle + '.json';
                  downloadLink.click();
                }
              });
              break;
            case 'csv': // Only csv
              const csvName = fileTitle + '-' + slugify(this._translateService.instant('summary.action_plan.title')) + '.csv';
              const blob = this.csvToBlob(csvName);
              let downloadLink = document.createElement('a');
              document.body.appendChild(downloadLink);

              if (navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, csvName);
              } else {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = csvName;
                downloadLink.click();
              }
              break;
            default:
              break;
          }
        }
      }
    }
  /****************************** END DOWNLOAD FILES *********************************/

  /****************************** CREATE EXPORTS ************************************/

    /**
     * Generate a ZIP with the docx + csv + json + all pictures
     * @param element block in the HTML view used to generate the docx in the zip
     * @param exports files to exports array ['doc', 'images', 'csv', 'json']
     */
    async generateExportsZip(element, exports: Array<string>) {
      // await setTimeout(async () => {
        const zipName = 'pia-' + slugify(this.pia.name) + '.zip';
        const JSZip = require('jszip');
        const zip = new JSZip();

        // Attach export files
        await this.addAttachmentsToZip(zip).then(async (zip2: any) => {

          if (exports.includes('doc')) { // Doc
            const dataDoc = await this.prepareDocFile(element);
            zip2.file('Doc/' + dataDoc.filename, dataDoc.blob);
          }

          if (exports.includes('json')) { // Json
            zip2.file('pia-' + slugify(this.pia.name) + '.json', this.piaJson, { binary: true });
          }

          if (exports.includes('csv')) { // Csv
            const fileTitle = this._translateService.instant('summary.action_plan.title');
            const blob = this.csvToBlob(fileTitle);
            zip2.file('CSV/' + slugify(fileTitle) + '.csv', blob, { binary: true });
          }

          if (exports.includes('images')) { // images
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

      // }, 500);
    }

    /****************************** CSV EXPORT ************************************/
      exportCSVFile(headers, items, fileTitle) {
        if (headers) {
          items.unshift(headers);
        }
        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);
        var csv = this.convertToCSV(jsonObject);
        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        return blob;
      }

      convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';
        for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
            if (line != '') line += ','
            line += array[i][index];
          }
          str += line + '\r\n';
        }
        return str;
      }

      /**
       * Prepare for CSV export
       */
      prepareCsv() {
        this.csvOptions = {
          fieldSeparator: ';',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          removeNewLines: true,
          headers: [
            `"${this._translateService.instant('summary.csv_section')}"`,
            `"${this._translateService.instant('summary.csv_title_object')}"`,
            `"${this._translateService.instant('summary.csv_action_plan_comment')}"`,
            `"${this._translateService.instant('summary.csv_evaluation_comment')}"`,
            `"${this._translateService.instant('summary.csv_implement_date')}"`,
            `"${this._translateService.instant('summary.csv_people_in_charge')}"`
          ]
        };
        this.csvContent = this._actionPlanService.csvRows;
      }

      csvToBlob(fileTitle) {
        const headers = {
          section: `"${this._translateService.instant('summary.csv_section')}"`,
          title: `"${this._translateService.instant('summary.csv_title_object')}"`,
          action_plan_comment: `"${this._translateService.instant('summary.csv_action_plan_comment')}"`,
          evaluation_comment: `"${this._translateService.instant('summary.csv_evaluation_comment')}"`,
          csv_implement_date: `"${this._translateService.instant('summary.csv_implement_date')}"`,
          csv_people_in_charge: `"${this._translateService.instant('summary.csv_people_in_charge')}"`
        };

        const csvContentFormatted = [];
        this.csvContent.forEach((item) => {
          const itemData = {}
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
            itemData['action_plan_comment'] = `"${item.action_plan_comment}"`.replace(/,/g, '').replace(/\n/g,' ');
          }
          if (item.evaluation_comment) {
            itemData['evaluation_comment'] = `"${item.evaluation_comment}"`.replace(/,/g, '').replace(/\n/g,' ');
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
       * @param element block in the HTML view used to generate the docx
       */
      async generateDocx(element) {
        return new Promise((resolve,reject)=> {
          this.prepareDocFile(element).then(dataDoc => {
            setTimeout(() => {
              const downloadLink = document.createElement('a');
              document.body.appendChild(downloadLink);
              if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveOrOpenBlob(dataDoc.blob, dataDoc.filename);
              } else {
                downloadLink.href = dataDoc.url;
                downloadLink.download = dataDoc.filename;
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
      async prepareDocFile(element) {
        const risksCartography = document.querySelector('#risksCartographyImg');
        const actionPlanOverview = document.querySelector('#actionPlanOverviewImg');
        const risksOverview = document.querySelector('#risksOverviewSvg');

        if (risksCartography && actionPlanOverview && risksOverview) {
          document.querySelector('#risksCartographyImg').remove();
          document.querySelector('#actionPlanOverviewImg').remove();
          document.querySelector('#risksOverviewSvg').remove();
        }

        const preHtml = '<html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:w=\'urn:schemas-microsoft-com:office:word\' xmlns=\'http://www.w3.org/TR/REC-html40\'><head><meta charset=\'utf-8\'><title>Export HTML To Doc</title></head><body>';
        const postHtml = '</body></html>';
        const html = preHtml + document.getElementById(element).innerHTML + postHtml;
        const blob = new Blob(['\ufeff', html], {
          type: 'application/msword'
        });
        const risksCartographyContainer = document.querySelector('.pia-risksCartographyContainer');
        const actionPlanOverviewContainer = document.querySelector('.pia-actionPlanGraphBlockContainer');
        const risksOverviewContainer = document.querySelector('.pia-risksOverviewBlock');
        if (risksCartographyContainer) {
          risksCartographyContainer.appendChild(risksCartography);
        }
        if (actionPlanOverviewContainer) {
          actionPlanOverviewContainer.appendChild(actionPlanOverview);
        }
        if (risksOverviewContainer) {
          risksOverviewContainer.appendChild(risksOverview);
        }
        return { url: 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html), blob, filename: 'pia.doc' };
      }
    /****************************** END DOC EXPORT ********************************/

    /**
     * Add all active attachments (not the removed ones) to the zip after converting them as blob files
     * @param zip
     */
    async addAttachmentsToZip(zip) {
      return new Promise(async (resolve, reject) => {
        this._attachmentsService.attachments.forEach(attachment => {
          if (attachment.file && attachment.file.length > 0) {
            const byteCharacters1 = atob((attachment.file as any).split(',')[1]);
            const folderName = this._translateService.instant('summary.attachments');
            zip.file(folderName + '/' + attachment.name, byteCharacters1, { binary: true });
          }
        });
        resolve(zip);
      });
    }


    /**
     * Download all graphs as images
     * @private
     */
    async downloadAllGraphsAsImages() {
      const JSZip = require('jszip');
      const zip = new JSZip();
      this.addImagesToZip(zip).then((zip2: any) => {
        zip2.generateAsync({ type: 'blob' }).then(blobContent => {
          FileSaver.saveAs(blobContent, 'pia-images.zip');
        });
      });
    }



    /**
     * Add images to the zip after converting them as blob files
     * @param zip
     */
    async addImagesToZip(zip) {
      return new Promise(async (resolve, reject) => {
        const actionPlanOverviewImg = await this.getActionPlanOverviewImg();
        const risksCartographyImg = await this.getRisksCartographyImg();
        const risksOverviewImg = await this.getRisksOverviewImgForZip();

        const byteCharacters1 = atob((actionPlanOverviewImg as any).split(',')[1]);
        const byteCharacters2 = atob((risksCartographyImg as any).split(',')[1]);
        const byteCharacters3 = atob((risksOverviewImg as any).split(',')[1]);

        zip.file('Images/actionPlanOverview.png', byteCharacters1, { binary: true });
        zip.file('Images/risksCartography.png', byteCharacters2, { binary: true });
        zip.file('Images/risksOverview.png', byteCharacters3, { binary: true });

        resolve(zip);
      });
    }

    /**
     * Download the action plan overview as an image
     * @async
     */
    async getActionPlanOverviewImg() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const actionPlanOverviewImg = document.querySelector('#actionPlanOverviewImg');
          if (actionPlanOverviewImg) {
            html2canvas(actionPlanOverviewImg, { scale: 1.4 }).then(canvas => {
              if (canvas) {
                const img = canvas.toDataURL();
                resolve(img);
              }
            });
          }
        }, 250);
      });
    }

    /**
     * Download the risks cartography as an image
     * @async
     */
    async getRisksCartographyImg() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const risksCartographyImg = document.querySelector('#risksCartographyImg');
          if (risksCartographyImg) {
            html2canvas(risksCartographyImg, { scale: 1.4 }).then(canvas => {
              if (canvas) {
                const img = canvas.toDataURL();
                resolve(img);
              }
            });
          }
        }, 250);
      });
    }

    /**
     * Generate a data format from the risk overview image. It can then be used in the Zip.
     * @async
     */
    async getRisksOverviewImgForZip() {
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
  /****************************** END CREATE EXPORTS *********************************/
}
