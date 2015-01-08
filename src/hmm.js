/* HMM.js main */

// Base function.
var HMM = function(providedConfig){
    this.config={
      states:[],
      symbols:[],
      transitionProbabilities:{},
      emissionProbabilities:{},
      startProbability:{},
      matchFactor:0.01
    };

    for (var attrname in providedConfig)  {
        this.config[attrname] = providedConfig[attrname];
    }

    var forEachState=function(callback){
      this.config.states.forEach(callback);
    }.bind(this);

    var matrixMatch=function(matrix1,matrix2,matchFactor){
      var rowKeys=Object.keys(matrix1);
      var colKeys;
      var diff=0;
      rowKeys.forEach(function(rowKey){
        colKeys=Object.keys(matrix1[rowKey]);
        colKeys.forEach(function(colKey){
          diff+=Math.abs(matrix1[rowKey][colKey]-matrix2[rowKey][colKey]);
        });
      });
      return diff<matchFactor;
    };

    var zeroReturningFunction=function(){return 0;};

    this.calculatePath=function(observations){
      var observationsClone=observations.slice(0);
      var viterbiCache=[{}];
      var path={};
      forEachState(function(state){
        viterbiCache[0][state]=this.config.startProbability[state]*this.config.emissionProbabilities[state][observationsClone[0]];
        path[state]=[state];
      }.bind(this));
      observationsClone.splice(0,1);
      observationsClone.forEach(function(observation,index){
        viterbiCache.push({});
        var newPath={};
        forEachState(function(currentState){
          var maximalSwitchForState=[0,undefined];
          forEachState(function(newState){
            var switchProbability=viterbiCache[index][newState]*this.config.transitionProbabilities[newState][currentState]*this.config.emissionProbabilities[currentState][observation];
            if(switchProbability>=maximalSwitchForState[0]){
              maximalSwitchForState=[switchProbability,newState];
            }
          }.bind(this));
          viterbiCache[index+1][currentState]=maximalSwitchForState[0];
          newPath[currentState]=path[maximalSwitchForState[1]].concat(currentState);
        }.bind(this));
        path=newPath;
      }.bind(this));
      var maximalPath=[0,undefined];
      forEachState(function(state){
        var fromCacheValue=viterbiCache[observationsClone.length][state];
        if(maximalPath[0]<=fromCacheValue){
          maximalPath=[fromCacheValue,state];
        }
      }.bind(this));
      return [maximalPath[0],path[maximalPath[1]]];
    };

    this.teach=function(observations){
      var calculatePathForObservation=function(observation){
        var calculatedPath=this.calculatePath(observation);
        return calculatedPath[1];
      }.bind(this),
      transitionsCount=0,
      emissionsCount=0,
      calculateMatrixForState=function(statesForObservation,index){
        var observation=observations[index];
        for(var s=0;s<statesForObservation.length-1;s++){
          var fromState=statesForObservation[s];
          var toState=statesForObservation[s+1];
          this.config.transitionProbabilities[fromState][toState]=this.config.transitionProbabilities[fromState][toState]+1;
          this.config.emissionProbabilities[fromState][observation[s]]=this.config.emissionProbabilities[fromState][observation[s]]+1;
          transitionsCount=transitionsCount+1;
          emissionsCount=emissionsCount+1;
        }
        var lastSymbol=statesForObservation.length-1;
        this.config.emissionProbabilities[statesForObservation[lastSymbol]][observation[lastSymbol]]=this.config.emissionProbabilities[statesForObservation[lastSymbol]][observation[lastSymbol]]+1;
        emissionsCount=emissionsCount+1;
      }.bind(this),
      divideMatrixsByCounts=function(state1){
        forEachState(function(state2){
          this.config.transitionProbabilities[state1][state2]=this.config.transitionProbabilities[state1][state2]/transitionsCount;
        }.bind(this));
        this.config.symbols.forEach(function(symbol){
          this.config.emissionProbabilities[state1][symbol]=this.config.emissionProbabilities[state1][symbol]/emissionsCount;
        }.bind(this));
      }.bind(this),
      oldEmissionMatrix,
      oldTransitionMatrix;
      do{
        var internalStates=observations.map(calculatePathForObservation);
        transitionsCount=0;
        emissionsCount=0;
        oldEmissionMatrix=this.config.emissionProbabilities;
        oldTransitionMatrix=this.config.transitionProbabilities;
        this.createProbabilitiesMatix(zeroReturningFunction,zeroReturningFunction);
        internalStates.forEach(calculateMatrixForState);
        forEachState(divideMatrixsByCounts);
      }
      while(!(matrixMatch(oldTransitionMatrix,this.config.transitionProbabilities,this.config.matchFactor)&&matrixMatch(oldEmissionMatrix,this.config.emissionProbabilities,this.config.matchFactor)));
    };

    this.initializeDefaultProbabilities=function(){
      this.createProbabilitiesMatix(Math.random,Math.random);
    };
    this.initializeDiagonalProbabilities=function(){
      forEachState(function(state1,index){
        this.config.transitionProbabilities[state1]={};
        this.config.emissionProbabilities[state1]={};
        var lastColumn=Math.min(this.config.states.length-1,index+1);
        var startColumn=Math.max(0,index-1);
        for(var x=startColumn;x<=lastColumn;x++){
          var stateColumn=this.config.states[x];
          this.config.transitionProbabilities[state1][stateColumn]=Math.random();
        }
        this.config.symbols.forEach(function(symbol){
          this.config.emissionProbabilities[state1][symbol]=Math.random();
        }.bind(this));

      }.bind(this));
    };

    this.createProbabilitiesMatix=function(defaultTransitionProbabilityProvider,defaultEmissionProbabilityProvider){
      forEachState(function(state1){
        this.config.transitionProbabilities[state1]={};
        this.config.emissionProbabilities[state1]={};

        forEachState(function(state2){
          this.config.transitionProbabilities[state1][state2]=defaultTransitionProbabilityProvider();
        }.bind(this));

        this.config.symbols.forEach(function(symbol){
          this.config.emissionProbabilities[state1][symbol]=defaultEmissionProbabilityProvider();
        }.bind(this));

      }.bind(this));
    };

  };

// Version.
HMM.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.HMM = HMM;
