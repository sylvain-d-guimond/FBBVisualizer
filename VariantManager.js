function VariantManager(config){
    this.groups = [];
    this.config = config;
}

VariantManager.prototype.discoverVariants  = function (scene){
    let matVariantName = this.config.variants.material+this.config.variants.separator;
    scene.materials.forEach(material =>{
        if (material.name.includes(matVariantName)){
            let regex = matVariantName+"([A-Za-z0-9]*)"+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reMatVariant = new RegExp(regex);
            let matches = reMatVariant.exec(material.name);
            if (matches && matches.length ===3){
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
                console.log("Material variant found but improperly formatted:", mesh.name);
            }
        }
    });


    let geoVariantName = this.config.variants.base +this.config.variants.geometry+ this.config.variants.separator;
    let matVariantTargetName = this.config.variants.base +this.config.variants.material+ this.config.variants.separator;
    scene.meshes.forEach(mesh => {
        if (mesh.name.includes(geoVariantName)){
            //Geometry variant found
            let regex = geoVariantName+"([A-Za-z0-9]*)"+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reGeoVariant = new RegExp(regex);
            let matches = reGeoVariant.exec(mesh.name);
            if (matches && matches.length === 3){
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
            let regex = matVariantTargetName+"([A-Za-z0-9]*)"+this.config.variants.separator+"([A-Za-z0-9]*)";
            let reMatVariant = new RegExp(regex);
            let matches = reMatVariant.exec(mesh.name);

            if (matches && matches.length === 3){
                let groupName = matches[1];
                let variantName = matches[2];
                
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

VariantManager.prototype.selectVariant = function (selectedVariant){
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