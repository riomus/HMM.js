
var MultiGeastureHMM = function(providedConfig){
    this.config={
      singularModel:ContinousHMM,
      modelInitializer:function(model){
        model.initializeDiagonalProbabilities();}
    };

    for (var attrname in providedConfig)  {
        this.config[attrname] = providedConfig[attrname];
    }

    var geasturesModels={};
    var geasturesNames=[];
    var globalCallbacks=[];

    var resetAllModels = function(){
      geasturesNames.forEach(function(geastureName){geasturesModels[geastureName].reset();});
    };
    this.calculatePath=function(observations){
      return this.standardHiddenMarkovModel.calculatePath(observations);
    };

    this.newSymbol=function(symbol){
      geasturesNames.forEach(function(geastureName){geasturesModels[geastureName].newSymbol(symbol);});
    };

    this.onDetect=function(callback,geasture){
      if(geasture){
        geasturesModels[geasture].onDetect(callback);
      }else{
        geasturesNames.forEach(function(geastureName){
          geasturesModels[geastureName].onDetect(function(data){
            callback({'name':geastureName,'data':data});
          });
        });
        globalCallbacks.push(callback);
      }

    };

    this.teach=function(geasture,observations){
      var model=new this.config.singularModel(this.config);
      this.config.modelInitializer(model);
      model.teach(observations);
      geasturesModels[geasture]=model;
      geasturesNames.push(geasture);
      model.onDetect(resetAllModels);

      globalCallbacks.forEach(function(callback){
        model.onDetect(function(data){callback({'name':geasture,'data':data});});
      });
    };
  };

// Version.
MultiGeastureHMM.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.MultiGeastureHMM = MultiGeastureHMM;
