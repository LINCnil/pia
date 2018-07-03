<img src="https://raw.githubusercontent.com/pia-lab/pialab/master/src/assets/images/pia-lab.png">

# PiaLab Frontend

**PiaLab** is based on [PIA](https://github.com/LINCnil/pia) but the [ backend](https://github.com/pia-lab/pialab-back) has been rewritten in PHP/Symfony so this Angular app is **not** compatible with the [PIA ruby backend](https://github.com/LINCnil/pia-back).

## Install

First things first, you need to set up the [ backend](https://github.com/pia-lab/pialab-back#pialab-backend) in order to use PiaLab.

Once ready

Install Angular cli via [NPM](https://www.npmjs.com/get-npm)
`npm install -g @angular/CLI `

Clone project 
`git clone https://github.com/pia-lab/pialab.git`
`cd pialab`

Install project dependencies
`npm install`

Create configuration file
`cp src/environments/environment.dev.ts.example src/environments/environment.dev.ts`

and fill your API credentials



Run `ng serve`  then visit localhost:4200
