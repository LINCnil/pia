import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-risks-cartography',
  templateUrl: './risks-cartography.component.html',
  styleUrls: ['./risks-cartography.component.scss']
})
export class RisksCartographyComponent implements OnInit {

  constructor() {
    this.loadCartography();
  }

  ngOnInit() {
    this.loadCartography();
  }

  // TODO : make loadCartography() loaded on init.

  /**
   * Loads the risks cartography
   */
  loadCartography() {
    // document ready
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {

      /* /!\ TO READ :
      *
      * Canvas size is 400 x 400
      * Canvas has 4 lines and 4 columns (numbered from 1 to 4, from top to bottom and from left to right)
      *
      * 16 blocks, each having a size of 100 x 100
      *
      * /!\ Dots placement in a block is the following :
      * dot x position : block x position + 20
      * dot y position : block y position + 80
      *
      * Example with a block (line 3, column 3) :
      * Block position is x = 200 and y = 200
      * Then the dot position will be x = 220 and y = 280
      *
      * /!\  For texts under evaluation dots, they are displayed this way :
      * text x position : dot x position
      * text y position : dot y position + 20
      * For the second text line (under first text), add 12 additionnal pixels to text y position
      *
      */

      /* TODO : associate gravity gauge to y-coordinates (red dots)
      * "Négligeable" : y coordinates for risk1, for risk2 and risk3
      * "Limitée" : y coordinates for risk1, for risk2 and risk3
      * "Importante" : y coordinates for risk1, for risk2 and risk3
      * "Maximale" : y coordinates for risk1, for risk2 and risk3
      *
      * TODO : associate probability gauge to x-coordinates (red dots)
      * SAME but for x coordinates
      *
      * TODO : then same for evaluation gauge (for blue dots)
      */

      // JSON data
      var dataJSON = {
        "risk1-data-access":{
          "author_dot":{
            "x":320,
            "y":280
          },
          "evaluator_dot":{
            "x":20,
            "y":380
          }
        },
        "risk2-data-change":{
          "author_dot":{
            "x":120,
            "y":80
          },
          "evaluator_dot":{
            "x":320,
            "y":80
          }
        },
        "risk3-data-disappearance":{
          "author_dot":{
            "x":220,
            "y":280
          },
          "evaluator_dot":{
            "x":20,
            "y":180
          }
        }
      };

      // Instanciation of canvas context
      const canvas = <HTMLCanvasElement>document.getElementById("actionPlanCartography");
      const context = canvas.getContext('2d');

      // White grid creation
      context.beginPath();
      context.moveTo(0, 300);
      context.lineTo(100, 300);
      context.lineTo(100, 400);
      context.moveTo(0, 200);
      context.lineTo(200, 200);
      context.lineTo(200, 400);
      context.moveTo(0, 100);
      context.lineTo(300, 100);
      context.lineTo(300, 400);
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.stroke();

      // TODO add some conditions to check if there are author dots in JSON (if author has filled them or not) and same for evaluator dots
      // To show nothing if there are none.

      // TODO : for each dots, check if there are some dots (6 dots) which are the same coordinates as the current one.
      // If so, for each other dots found, applies a coordonate y + 10 (then +20, +30...) (where i = 0; i < dots found; i++)
      // So that dots and texts are displayed each one under each one.

      // Author dots (red)
      context.beginPath();
      context.fillStyle = "#FD4664";
      context.arc(dataJSON["risk1-data-access"]["author_dot"].x, dataJSON["risk1-data-access"]["author_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();
      context.textAlign = "center";
      context.font = "bold 1.1rem 'Roboto', Times, serif";
      context.fillStyle = "#333";
      // TODO if evaluator dot x = 20 then text + 50 whereas of 20 and text 2 + 62 whereas of 32.
      // Same for bottom border :/
      try{
        context.fillText("Accès illégitime", dataJSON["risk1-data-access"]["author_dot"].x, dataJSON["risk1-data-access"]["author_dot"].y + 20);
        context.fillText("à des données", dataJSON["risk1-data-access"]["author_dot"].x, dataJSON["risk1-data-access"]["author_dot"].y + 32);
      }catch(ex){}

      context.beginPath();
      context.fillStyle = "#FD4664";
      context.arc(dataJSON["risk2-data-change"]["author_dot"].x, dataJSON["risk2-data-change"]["author_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();
      context.textAlign = "center";
      context.font = "bold 1.1rem 'Roboto', Times, serif";
      context.fillStyle = "#333";
      // TODO if evaluator dot x = 20 then text + 50 whereas of 20 and text 2 + 62 whereas of 32.
      // Same for bottom border :/
      try{
        context.fillText("Modification non désirée", dataJSON["risk2-data-change"]["author_dot"].x, dataJSON["risk2-data-change"]["author_dot"].y + 20);
        context.fillText("de données", dataJSON["risk2-data-change"]["author_dot"].x, dataJSON["risk2-data-change"]["author_dot"].y + 32);
      }catch(ex){}

      context.beginPath();
      context.fillStyle = "#FD4664";
      context.arc(dataJSON["risk3-data-disappearance"]["author_dot"].x, dataJSON["risk3-data-disappearance"]["author_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();
      context.textAlign = "center";
      context.font = "bold 1.1rem 'Roboto', Times, serif";
      context.fillStyle = "#333";
      // TODO if evaluator dot x = 20 then text + 50 whereas of 20 and text 2 + 62 whereas of 32.
      // Same for bottom border :/
      try{
        context.fillText("Disparition", dataJSON["risk3-data-disappearance"]["author_dot"].x, dataJSON["risk3-data-disappearance"]["author_dot"].y + 20);
        context.fillText("de données", dataJSON["risk3-data-disappearance"]["author_dot"].x, dataJSON["risk3-data-disappearance"]["author_dot"].y + 32);
      }catch(ex){}

      // Evaluator dots (blue)
      context.beginPath();
      context.fillStyle = "#091C6B";
      context.arc(dataJSON["risk1-data-access"]["evaluator_dot"].x, dataJSON["risk1-data-access"]["evaluator_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();

      context.beginPath();
      context.fillStyle = "#091C6B";
      context.arc(dataJSON["risk2-data-change"]["evaluator_dot"].x, dataJSON["risk2-data-change"]["evaluator_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();

      context.beginPath();
      context.fillStyle = "#091C6B";
      context.arc(dataJSON["risk3-data-disappearance"]["evaluator_dot"].x, dataJSON["risk3-data-disappearance"]["evaluator_dot"].y, 7, 0, Math.PI * 2, true);
      context.fill();

      // Gradient color definition for dotted lines
      const grad = context.createLinearGradient(50, 50, 150, 150);

      // Dotted lines params
      context.setLineDash([0.1,1.8]);
      context.lineWidth = 0.3;

      // Dotted lines
      context.beginPath();
      const gradRisk1 = context.createLinearGradient(dataJSON["risk1-data-access"]["author_dot"].x, dataJSON["risk1-data-access"]["author_dot"].y, dataJSON["risk1-data-access"]["evaluator_dot"].x, dataJSON["risk1-data-access"]["evaluator_dot"].y);
      gradRisk1.addColorStop(0, "#FD4664");
      gradRisk1.addColorStop(1, "#091C6B");
      context.strokeStyle = gradRisk1;
      context.moveTo(dataJSON["risk1-data-access"]["author_dot"].x,dataJSON["risk1-data-access"]["author_dot"].y);
      context.lineTo(dataJSON["risk1-data-access"]["evaluator_dot"].x,dataJSON["risk1-data-access"]["evaluator_dot"].y);
      context.closePath();
      context.stroke();

      context.beginPath();
      const gradRisk2 = context.createLinearGradient(dataJSON["risk2-data-change"]["author_dot"].x, dataJSON["risk2-data-change"]["author_dot"].y, dataJSON["risk2-data-change"]["evaluator_dot"].x, dataJSON["risk2-data-change"]["evaluator_dot"].y);
      gradRisk2.addColorStop(0, "#FD4664");
      gradRisk2.addColorStop(1, "#091C6B");
      context.strokeStyle = gradRisk2;
      context.moveTo(dataJSON["risk2-data-change"]["author_dot"].x,dataJSON["risk2-data-change"]["author_dot"].y);
      context.lineTo(dataJSON["risk2-data-change"]["evaluator_dot"].x,dataJSON["risk2-data-change"]["evaluator_dot"].y);
      context.closePath();
      context.stroke();

      context.beginPath();
      const gradRisk3 = context.createLinearGradient(dataJSON["risk3-data-disappearance"]["author_dot"].x, dataJSON["risk3-data-disappearance"]["author_dot"].y, dataJSON["risk3-data-disappearance"]["evaluator_dot"].x, dataJSON["risk3-data-disappearance"]["evaluator_dot"].y);
      gradRisk3.addColorStop(0, "#FD4664");
      gradRisk3.addColorStop(1, "#091C6B");
      context.strokeStyle = gradRisk3;
      context.moveTo(dataJSON["risk3-data-disappearance"]["author_dot"].x,dataJSON["risk3-data-disappearance"]["author_dot"].y);
      context.lineTo(dataJSON["risk3-data-disappearance"]["evaluator_dot"].x,dataJSON["risk3-data-disappearance"]["evaluator_dot"].y);
      context.closePath();
      context.stroke();

      }
    };
  }

}
