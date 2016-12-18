const mongoose=require('mongoose');
const paginate=require('mongoose-paginate');

let articleSchema=mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    author:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
    category:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Category'},
    image:{data:Buffer,contentType:String,path:String,name:String},
    date:{type:Date,default:Date.now()},
    likes:[{type:mongoose.Schema.Types.ObjectId}]
});
articleSchema.plugin(paginate);
articleSchema.method({
   prepareInsert:function () {
       let User=mongoose.model('User');
       User.findById(this.author).then(user=>{
           user.articles.push(this.id);
           user.save();
       });
       let Category=mongoose.model('Category');
       Category.findById(this.category).then(category=>{
           if(category){
               category.articles.push(this.id);
               category.save();
           }
       });
   } ,
    prepareDelete:function () {
        let User=mongoose.model('User');
        User.findById(this.author).then(user=>{
            if(user){
                user.articles.remove(this.id);
                user.save();
            }
        });
        let Category=mongoose.model('Category');
        Category.findById(this.category).then(category=>{
            if(category){
                category.articles.remove(this.id);
                category.save();
            }
        });
    }
});

const Article=mongoose.model('Article',articleSchema);

module.exports=Article;
