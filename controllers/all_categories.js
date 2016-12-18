const mongoose=require('mongoose');
const Article=mongoose.model('Article');
const User=mongoose.model('User');
const Category=mongoose.model('Category');

const hbs = require("hbs");
const paginate=require('handlebars-paginate');
hbs.registerHelper('paginate',paginate);

module.exports = {
    index: (req, res) => {

        Category.paginate({}, { page: req.query.page, limit: 10,sort:{name:1} }, function(err, categories) {

            res.render(`home/all_categories`,{categories:categories.docs,pagination:{

                page:req.query.page,
                pageCount:3

            }});

        });




},
    listCategoryArticles:(req,res)=>{
        let id=req.params.id;
        Category.findById(id).populate({
            path:'articles'
        }).then(category=>{

            User.populate(category.articles,{path:'author'},(err)=> {
                if (err) {
                    console.log(err.message);
                }
                    Article.paginate({category},{page:req.query.page,limit:5,select:'author title likes content image',populate:'author'},function (err,result) {
                        res.render(`home/article`,{articles:result.docs,category:category,pagination:{
                            page:req.query.page,
                            pageCount:category.articles.length/5
                        }});

                    });


            });

        });


    }
};
