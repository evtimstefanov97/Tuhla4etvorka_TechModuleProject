var message = require("express/lib/response.js");
const Article=require('mongoose').model('Article');
const Category=require('mongoose').model('Category');
const User=require('mongoose').model('User');
const multer=require('multer');
var fs = require("fs");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/Article_images');
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+file.originalname);
    }
});
var upload=multer({storage:storage});
module.exports= {
    createGet: (req, res)=> {
        if(!req.isAuthenticated()){
            let returnUrl='/article/create';
            req.session.returnUrl=returnUrl;
            res.redirect('/user/login');
            return;
        }
        Category.find({}).then(categories=>{
            res.render('article/create',{categories:categories});
        });

    },
    createPost: (req, res)=> {
        let articleArgs = req.body;
        let errorMsg = '';
        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles!'
        } else if (!articleArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!articleArgs.content) {
            errorMsg = 'Invalid content!';
        }
        if (errorMsg) {
            res.render('article/create', {error: errorMsg});
            return;
        }
        articleArgs.author = req.user.id;
        var articleObject=new Article();
        articleObject.id=req.user.id;
        articleObject.image.data=fs.readFileSync(req.file.path);
        articleObject.image.path=req.file.path;
        articleObject.image.contentType='image/png';
        articleObject.image.name=req.file.filename;
        articleObject.category=req.body.category;
        articleObject.title=req.body.title;
        articleObject.author=req.user.id;
        articleObject.content=req.body.content;
        Article.create(articleObject).then(article=> {
           article.prepareInsert();
          res.redirect('/');
        });
    },
    details: (req, res)=> {
        let id = req.params.id;
        Article.findById(id).populate('author tags').then(article=> {
            if(!req.user){
                res.render('article/details',{article:article,isUserAuthorized:false});
                return;
            }
            req.user.isInRole('Admin').then(isAdmin=>{
                let isUserAuthorized=isAdmin || req.user.isAuthor(article);
                res.render('article/details',{article:article,isUserAuthorized:isUserAuthorized});
            })
        });
    },
    editGet: (req, res)=> {
        let id = req.params.id;
        if(!req.isAuthenticated()){
            let returnUrl=`/article/edit/${id}`;
            req.session.returnUrl=returnUrl;
            res.redirect('/user/login');
            return;
        }
        Article.findById(id).populate('tags').then(article=>{
            req.user.isInRole('Admin').then(isAdmin=>{
                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories=>{
                    article.categories=categories;

                    res.render('article/edit',article);
                });

            });
        });
    },
    editPost: (req, res)=> {
        let id=req.params.id;
        let articleArgs=req.body;
        let title=req.body.title;
        let content=req.body.content;
        Article.findById(id).populate('category').then(article=>{
            if(article.category.id!==articleArgs.category){
                article.category.articles.remove(article.id);
                article.category.save();
            }
            article.category=articleArgs.category;
            article.title=articleArgs.title;
            article.content=articleArgs.content;
            article.save((err)=>{
                if(err){
                    console.log(err.message);
                }
                Category.findById(article.category).then(category=>{
                    if(category.articles.indexOf(article.id)===-1){
                        category.articles.push(article.id);
                        category.save();
                    }
                    res.redirect(`/article/details/${id}`);
                })
            });
        });
    },
    deleteGet:(req,res)=>{
        let id = req.params.id;
        if(!req.isAuthenticated()){
            let returnUrl=`article/delete/${id}`;
            req.session.returnUrl=returnUrl;
            res.redirect('/user/login');
            return;
        }
        Article.findById(id).populate('category tags').then(article=>{
            req.user.isInRole('Admin').then(isAdmin=>{
                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }

                res.render('article/delete',article);
            });
        });
    },
    deletePost:(req,res)=> {
        let id = req.params.id;

        Article.findOneAndRemove({_id: id}).then(article => {
            article.prepareDelete();
            res.redirect('/');
        });
    },
    likePost:(req,res,next)=>{
        let id = req.params.id;
        if(!req.isAuthenticated()){
            let returnUrl=`article/delete/${id}`;
            req.session.returnUrl=returnUrl;
            res.redirect('/user/login');
            return;
        }
        console.log(req.user.id);
        Article.findById(id).then(article=>{
            if(article.likes.indexOf(req.user.id)<0){
                console.log("not here");
                article.likes.push(req.user.id);
                article.save();
                res.redirect('back');

            }else{
              article.likes.pull(req.user.id);
              article.save();
                res.redirect('back');
            }

        });

    },
    topfive:(req,res)=>{
       Article.find({}).sort({likes:-1}).limit(5).populate('author').then(articles=>{
           res.render('home/topfive',{articles:articles})
       })




    }
};




