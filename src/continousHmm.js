
var ContinousHMM = function(providedConfig){
    this.config={
      standardHiddenMarkovModel:HMM,
      minimalProbabilityFactor:0.95
    };

    for (var attrname in providedConfig)  {
        this.config[attrname] = providedConfig[attrname];
    }

    this.standardHiddenMarkovModel=new this.config.standardHiddenMarkovModel(this.config);
    var measuringObservations=[];
    var detectCallback=[];

    this.calculatePath=function(observations){
      return this.standardHiddenMarkovModel.calculatePath(observations);
    };

    this.newSymbol=function(symbol){
      measuringObservations.push([]);
      measuringObservations.forEach(function(observation){
        observation.push(symbol);
      }.bind(this));
      var foundMatch=false;
      measuringObservations=measuringObservations.filter(function(observation){
        var measuredProbability=this.calculatePath(observation);
        if(observation.length>=this.averageObservationLength&&!foundMatch){
          if(measuredProbability[0]>this.averageProbability*this.config.minimalProbabilityFactor){
            foundMatch=true;
            detectCallback.forEach(function(callback){
            callback(measuredProbability);
            });

          }
        }
        if(measuredProbability[0]<this.averageProbability*this.config.minimalProbabilityFactor){
          return false;
        }
        return !foundMatch;
      }.bind(this));
    };

    this.onDetect=function(callback){
      detectCallback.push(callback);
    };

    this.reset=function(){
      measuringObservations=[];
    };


    this.teach=function(observations){
      this.averageObservationLength=observations.reduce(function(r,observation){return Math.min(r,observation.length);},9999999999);
      this.standardHiddenMarkovModel.teach(observations);
      this.averageProbability=observations.map(function(observation){return this.calculatePath(observation);}.bind(this))
      .map(function(path){return path[0];}).reduce(function(r,prob){return Math.min(r,prob);},15);
    };

    this.initializeDefaultProbabilities=function(){
      this.standardHiddenMarkovModel.initializeDefaultProbabilities();
    };
    this.initializeDiagonalProbabilities=function(){
      this.standardHiddenMarkovModel.initializeDiagonalProbabilities();

    };

    this.createProbabilitiesMatix=function(defaultTransitionProbability,defaultEmissionProbability){
      this.standardHiddenMarkovModel.initializeDiagonalProbabilities(defaultTransitionProbability,defaultEmissionProbability);
    };

  };

// Version.
ContinousHMM.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.ContinousHMM = ContinousHMM;
