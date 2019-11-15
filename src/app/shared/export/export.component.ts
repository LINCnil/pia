import { Component, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as html2canvas from 'html2canvas';
import { saveSvgAsPng, svgAsPngUri } from 'save-svg-as-png';
import { PiaService } from 'src/app/services/pia.service';
import { AttachmentsService } from 'src/app/entry/attachments/attachments.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { ActionPlanService } from 'src/app/entry/entry-content/action-plan/action-plan.service';
import { TranslateService } from '@ngx-translate/core';
declare const require: any;

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

      this.prepareCsv();

      this._attachmentsService.pia = this.pia;
      this._attachmentsService.listAttachments();

      if (this.pia.is_archive === 1) {
        this.fromArchives = true;
      }
    });
  }

  ngAfterViewChecked() {
    document.querySelector('angular2csv > button').innerHTML = this._translateService.instant('summary.download_csv');
  }
  
  /**
   * Generate a ZIP with the docx + all pictures
   * @param element block in the HTML view used to generate the docx in the zip
   */
  async generateZip(element) {
    setTimeout(() => {
      const dataDoc = this.prepareDocFile(element);
      const JSZip = require('jszip');
      const zip = new JSZip();

      /* Attachments */
      this.addAttachmentsToZip(zip).then((zip2: any) => {

        /* CSV */
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
            title: itemData["title"],
            blank: itemData["blank"],
            short_title: itemData["short_title"],
            action_plan_comment: itemData["action_plan_comment"],
            evaluation_comment: itemData["evaluation_comment"],
            evaluation_date: itemData["evaluation_date"],
            evaluation_charge: itemData["evaluation_charge"]
          });
        });
        var fileTitle = this._translateService.instant('summary.action_plan.title');
        const blob = this.exportCSVFile(headers, csvContentFormatted, fileTitle);
        zip2.file("CSV/" + fileTitle + '.csv', blob, { binary: true });

        /* Images */
        this.addImagesToZip(zip).then((zip3: any) => {
          /* Doc */
          zip3.file("Doc/" + dataDoc.filename, dataDoc.blob);
          zip3.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, 'pia-' + this.pia.name + '.zip');
          });
        });
      });

    }, 500);
  }

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
   *
   * @param element block in the HTML view used to generate the docx
   */
  async generateDocx(element) {
    setTimeout(() => {
      const dataDoc = this.prepareDocFile(element);

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
    }, 500);
  }

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
   * Prepare .doc file
   */
  prepareDocFile(element) {
    const risksCartography = document.querySelector('#risksCartographyImg');
    const actionPlanOverview = document.querySelector('#actionPlanOverviewImg');
    const risksOverview = document.querySelector('#risksOverviewSvg');
    if (risksCartography && actionPlanOverview && risksOverview) {
      document.querySelector('#risksCartographyImg').remove();
      document.querySelector('#actionPlanOverviewImg').remove();
      document.querySelector('#risksOverviewSvg').remove();
    }
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
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

  /**
   * Toggle the menu with the individual exports
   */
  toggleIndividualExports() {
    const exportLinksList = document.querySelector('.pia-exportBlock-individual-links');
    const individualExports = document.querySelector('.pia-exportBlock-individual');
    if (exportLinksList && individualExports) {
      exportLinksList.classList.toggle('hide');
      individualExports.classList.toggle('activeMenu');
    }
  }

}
