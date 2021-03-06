function VariantManager(config){
    this.groups = [];
    this.config = config;
}

VariantManager.prototype.discoverVariants  = function (scene){
    let matVariantName = this.config.variants.material+this.config.variants.separator;

    console.log("Discover variants named:", matVariantName, "in", scene.materials.length,"materials");
    scene.materials.forEach(material =>{
        if (material.name.includes(matVariantName)){
            //console.log("Found material:", material.name);
            let regex = matVariantName+"([A-Za-z0-9]*)"+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reMatVariant = new RegExp(regex);
            let matches = reMatVariant.exec(material.name);
            if (matches !== null){
                if (matches.length ===3){
                    let groupName = matches[1];
                    let variantName = matches[2];

                    var group = this.groups.filter(aGroup => {
                        return aGroup.name === groupName;
                    });
                    
                    if (group.length < 1){
                        group = new VariantGroup(groupName, this.config.variants.material);
                        group.target = [];
                        this.groups.push(group);
                        console.log("Created material group:", groupName);
                    } else{ group = group[0];}
                    
                    group.variants.push(new Variant(variantName, material));
                    console.log("Created material variant:", variantName, "in group:", groupName);
                } else{
                    console.log("Material variant found but improperly formatted:", material.name);
                }
            } else{
                console.log("Material variant found but improperly formatted:", material.name);
            }
        }
    });


    let geoVariantName = this.config.variants.base +this.config.variants.geometry+ this.config.variants.separator;
    let matVariantTargetName = this.config.variants.material+ this.config.variants.separator;

    console.log("Discover geo variants named:", geoVariantName, "and material targets named:", matVariantTargetName);
    scene.meshes.forEach(mesh => {
        //console.log("Found mesh:", mesh.name);
        if (mesh.name.includes(geoVariantName)){
            //console.log("Found geo variant mesh:", mesh.name);
            //Geometry variant found
            let regex = geoVariantName+"([A-Za-z0-9]*)"+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reGeoVariant = new RegExp(regex);
            let matches = reGeoVariant.exec(mesh.name);
            if (matches !== null && matches.length === 3){
                let groupName = matches[1];
                let variantName = matches[2];

                var group = this.groups.filter(aGroup => {
                    return aGroup.name === groupName;
                });
                
                if (group.length < 1){
                    group = new VariantGroup(groupName, this.config.variants.geometry);
                    this.groups.push(group);
                    console.log("Created geo group:", groupName);
                } else{ group = group[0];}

                group.variants.push(new Variant(variantName, mesh))
                console.log("Created geo variant:", variantName, "in group:", groupName);

            } else{
                console.log("Geo variant found but improperly formatted:", mesh.name);
            }
        }

        if (mesh.name.includes(matVariantTargetName)){
            //console.log("Found mat variant mesh:", mesh.name);
            let regex = matVariantTargetName+"([A-Za-z0-9]*)";//+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reMatVariant = new RegExp(regex);
            let matches = reMatVariant.exec(mesh.name);

            if (matches !== null && matches.length === 2){
                let groupName = matches[1];
                //let variantName = matches[2];
                
                var group = this.groups.filter(aGroup => {
                    return aGroup.name === groupName &&
                            aGroup.type === this.config.variants.material;
                });
                
                if (group.length > 0){
                    group[0].target.push(mesh);
                    console.log("Found target for material group:", mesh.name);
                } else{
                    console.log("Group missing for material target:", mesh.name);
                }
            }else{
                console.log("Material variant target found but improperly formatted:", mesh.name);
            }
        }
    });
}

VariantManager.prototype.setVariantFromConfig = function(variantName){
    let variant = this.config.variantOptions.filter(v => {return v.name === variantName;})[0];

    variant.assignments.forEach(varAssign =>{
        let mesh = scene.meshes.filter(m => {
            return m.name === varAssign.mesh;})[0];
        let material = scene.materials.filter(mat => {return mat.name === varAssign.material;})[0];

        if (!mesh){
            mesh = scene.meshes.filter(m=>{return m.name === varAssign.mesh+"_primitive"+varAssign.slot;})[0];
        }

        console.log("Found mesh", mesh, "and material", material);
        mesh.material = material;
    })
}

VariantManager.prototype.selectVariant = function (selectedVariant){
    console.log("Select variant:", selectedVariant);

    if (typeof selectedVariant === "string"){
        //console.log("variant name found, looking for object");
        var theGroup = this.groups.filter(aGroup => {
            var theVariant = aGroup.variants.filter(aVariant => {
                if (typeof selectedVariant === "string"){
                    let variantSet = selectedVariant.split(' ');
                    if (variantSet.length === 2){
                        return aVariant.name.includes(variantSet[1]) &&
                            aGroup.name.includes(variantSet[0]);
                    }else{
                        return aVariant.name.includes(selectedVariant);
                    }
                } else {return false;}
            })

            var found = theVariant.length > 0;
            if (found){
                selectedVariant = theVariant[0];
            }
            return found;
        })
    }

    var group = this.groups.filter(aGroup => {
        return aGroup.variants.includes(selectedVariant);
    });

    if (group.length > 0){
        group = group[0];
        if (group.type === this.config.variants.geometry){
            //Select geometry variant
            group.variants.forEach(variant => {
                variant.target.setEnabled(variant == selectedVariant);
            });
        } else if (group.type === this.config.variants.material){
            //Select material variant
            group.target.forEach(target => {
                target.material = selectedVariant.target;
            });
        }
    } else{
        console.log("Group for variant",selectedVariant,"not found");
    }
}

VariantManager.prototype.selectDefaults = function(scene){
    console.log("Select default variants");
    scene.defaultVariants.forEach(aVariant => {
        console.log("Select default variant:", aVariant);
        this.setVariantFromConfig(aVariant);
    })
}

/******* Variant Group ********/
function VariantGroup(name, type, target = ""){
    this.name = name;
    this.variants = [];
    this.type = type;
    this.target = target;
}

/******* Variants ********/
function Variant(name, target = ""){
    this.name = name;
    this.target = target;
}