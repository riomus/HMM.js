
var MultiGestureHMM = function(providedConfig){
    this.config={
      singularModel:ContinousHMM,
      modelInitializer:function(model){
        model.initializeDefaultProbabilities();}
    };

    for (var attrname in providedConfig)  {
        this.config[attrname] = providedConfig[attrname];
    }

    var gesturesModels={};
    var gesturesNames=[];
    var globalCallbacks=[];

    var resetAllModels = function(){
      gesturesNames.forEach(function(gestureName){gesturesModels[gestureName].reset();});
    };
    this.calculatePath=function(observations){
      return this.gesturesNames.map(function(gestureName){
        return gesturesModels[gestureName].calculatePath(observations);
      }).reduce(function(reduce,returned){return returned[0]>reduce[0]?returned:reduce;},[-1]);
    };

    this.newSymbol=function(symbol){
      gesturesNames.forEach(function(gestureName){gesturesModels[gestureName].newSymbol(symbol);});
    };

    this.onDetect=function(callback,geasture){
      if(geasture){
        gesturesModels[geasture].onDetect(callback);
      }else{
        gesturesNames.forEach(function(gestureName){
          gesturesModels[gestureName].onDetect(function(data){
            callback({'name':gestureName,'data':data});
          });
        });
        globalCallbacks.push(callback);
      }

    };

    this.teach=function(geasture,observations){
      var model=new this.config.singularModel(this.config);
      this.config.modelInitializer(model);
      model.teach(observations);
      gesturesModels[geasture]=model;
      gesturesNames.push(geasture);
      model.onDetect(resetAllModels);

      globalCallbacks.forEach(function(callback){
        model.onDetect(function(data){callback({'name':geasture,'data':data});});
      });
    };
  };

// Version.
MultiGestureHMM.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.MultiGestureHMM = MultiGestureHMM;
