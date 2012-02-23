(function() {
	
	function DojoMobileViewSceneManager(context) {
		this.context = context;
		//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
		this.name = 'Dojo Mobile Views'; //FIXME: Needs to be localized
		this.category = 'DojoMobileView';
	}
	
	DojoMobileViewSceneManager.prototype.id = 'DojoMobileViews';
	DojoMobileViewSceneManager.prototype.title = 'Dojo Mobile Views';	//FIXME: Need to be globalized
		
	DojoMobileViewSceneManager.prototype.viewAdded = function(parent, child){
		dojo.publish("/davinci/scene/added", [this, parent, child]);
	};
	// View has been deleted from the given parent
	DojoMobileViewSceneManager.prototype.viewDeleted = function(parent){
		dojo.publish("/davinci/scene/removed", [this, parent, child]);
	};
	DojoMobileViewSceneManager.prototype.viewSelectionChanged = function(parent, child){
		if(child && child.id){
			dojo.publish("/davinci/scene/selectionChanged", [this, child.id]);
		}
	};
	DojoMobileViewSceneManager.prototype.selectScene = function(params){
		var sceneId = params.sceneId;
		var dj = this.context.getDojo();
		var node = dj.byId(sceneId);
		if(node){
			var widget = node._dvWidget;
			if(widget){
				var helper = widget.getHelper();
				if(helper && helper._updateVisibility){
					helper._updateVisibility(node);
				}
			}
		}
	};
	DojoMobileViewSceneManager.prototype.getAllScenes = function(){
		var dj = this.context.getDojo();
		var scenes = [];
		var flattenedScenes = [];
		var views = dj.query('.mblView');
		for(var i=0; i<views.length; i++){
			var view = views[i];
			var o = { sceneId:view.id, name:view.id, type:this.category };
			if(dojo.hasClass(view.parentNode, 'mblView')){
				o.parentNodeId = view.parentNode.id;		// temporary property, removed below
			}
			scenes.push(o);
			flattenedScenes.push(o);
		}
		// The fetch operation above delivers a simple array of Views.
		// We need to return a data structure that reflects the hierarchy of Views,
		// so massage the scenes array so that nested Views are moved under the correct parent View.
		var idx = 0;
		while(idx < scenes.length){
			var scene = scenes[idx];
			parentNodeId = scene.parentNodeId;
			if(parentNodeId){
				delete scene.parentNodeId;	// remove temporary property
				var spliced = false;
				for(var j=0; j<flattenedScenes.length; j++){
					if(flattenedScenes[j].name === parentNodeId){
						if(!flattenedScenes[j].children){
							flattenedScenes[j].children = [];
						}
						scene.parentSceneId = flattenedScenes[j].sceneId;
						flattenedScenes[j].children.push(scene);
						scenes.splice(idx, 1);
						spliced = true;
						break;
					}
				}
				if(!spliced){
					console.error('could not find parentNodeId='+parentNodeId);
					idx++;
				}
			}else{
				idx++;
			}
		}
		return scenes;
	};

    return {
//        init: function(args) {
//        },
        
        onFirstAdd: function(type, context) {
        	//FIXME: How to do nls? Maybe need to convert callback.js to AMD and leverage AMD's I18N?
        	context.registerSceneManager(new DojoMobileViewSceneManager(context));
            return;
//        },
//        
//        onAdd: function(type, context) {
//        },
//        
//        onLastRemove: function(type, context) {
//        },
//        
//        onRemove: function(type, context) {
        }
    };

})();
