const chalk = require('chalk');

class Groups{
    constructor(){
        this._groups = {}

        // flatten group
        this._flatten= function(group, groups){
            var users = new Set()
            
            group.users.map((u)=>{
                users.add(u)
            })

            group.groups.map((g)=>{
                g = groups[g]
                Array.from(this._flatten(g, groups)).map((u)=>{
                    users.add(u)
                })
            })
            return users 
        }
        
        this.list = function(){
            var res = []
            for(var g in this._groups){
                res.push(g)
            }
            return res
        }  
        
        this.load = async function(groups){
            this._groups = groups
            for(var item in this._groups){
                var g = this._groups[item]
                // make sure subgroups exis
                var subgroups =g.groups
                for(var i=0; i< subgroups.length; i++){
                    if(!(subgroups[i] in this._groups)){
                        throw new Error(`Group ${subgroups[i]} does not exist`)
                    }
                }
                // flatten users
                g._allUsers =  Array.from(this._flatten(g, this._groups))
                
            }
            return this
        }

        this.get =  async function(name){
            if(!name in this._groups){
                throw new Error("Not found")
            }
            return this._groups[name]
        }

        this.parseAcl = async function (aclData) {
            var acls  = {"secrets": {}, "users": {}}
            var users = {}
            for(var i=0; i < aclData.length; i++){
                var acl = aclData[i]
                for(var j=0; j < acl.secrets.length; j++){
                    var s = acl.secrets[j]
                    if(! (s in acl.secrets)){
                        acls.secrets[s] = []
                    }

                    acls.secrets[s].push(...acl.rights)
                }

                await acl.groups.forEach(async (g)=>{
                    try{
                        var groupObj = await this.get(g)
                        groupObj._allUsers.forEach((u)=>{
                            if(!(u in users)){
                                users[u] = {"rights": new Set()}
                            }
                            var rights = [...acl.rights]        

                            for(var m=0; m < rights.length; m++ ){
                                users[u].rights.add(rights[m])
                            }
                        })
                    }catch(e){
                        console.log(chalk.red(`    ✓ (Group (${g}) can not be found .. ignoring`))
                    }
                })
                for (var k=0; k < acl.users.length; k++){
                    acl.users.forEach((u)=>{
                        if(!(u in users)){
                            users[u] = {"rights": new Set()}
                        }
                        
                        var rights = [...acl.rights]
                        for(var m=0; m < rights.length; m++ ){
                            users[u].rights.add(rights[m])
                        }
                    })

                }

            }
            for (var s in acls.secrets){
                acls.secrets[s] =  Array.from(new Set(acls.secrets[s]))
            }
            acls.users = users
            return acls
        }
    }
}

module.exports = new Groups()