const userController =require('./../controllers/user');
const homeController=require('./../controllers/home');
const adminController=require('./../controllers/admin/admin');
const articleController=require('./../controllers/article');
const allController=require('./../controllers/all_categories');


var mongoose = require("mongoose");
const paginate=require('express-paginate');

module.exports=(app)=>{

    app.get('/',homeController.index);
    app.get('/home/all_categories',allController.index);
    app.get('/category/:id',allController.listCategoryArticles);

    app.get('/user/register',userController.registerGet);

    app.post('/user/register', upload.single('myFile'),userController.registerPost);

    app.get('/user/login',userController.loginGet);
    app.post('/user/login',userController.loginPost);
    app.get('/user/logout',userController.logout);
    app.post('/',userController.logout);
    app.get('/article/create',articleController.createGet);
    app.post('/article/create',upload.single('myFile'),articleController.createPost);
    app.get('/article/details/:id',articleController.details);
    app.get('/article/edit/:id',articleController.editGet);
    app.post('/article/edit/:id',articleController.editPost);
    app.get('/article/delete/:id',articleController.deleteGet);
    app.post('/article/delete/:id',articleController.deletePost);
    app.get('/admin/user/edit/:id',adminController.user.editGet);
    app.post('/admin/user/edit/:id',adminController.user.editPost);
    app.get('/admin/user/delete/:id',adminController.user.deleteGet);
    app.post('/admin/user/delete/:id',adminController.user.deletePost);
    app.get('/admin/category/all',adminController.category.all);
    app.get('/admin/category/create',adminController.category.createGet);
    app.post('/admin/category/create',adminController.category.createPost);
    app.get('/admin/category/edit/:id',adminController.category.editGet);
    app.post('/admin/category/edit/:id',adminController.category.editPost);
    app.get('/admin/category/delete/:id',adminController.category.deleteGet);
    app.post('/admin/category/delete/:id',adminController.category.deletePost);
    app.post('/article/like/:id',articleController.likePost);
    app.get('/home/topfive/',articleController.topfive);
    app.use((req,res,next)=>{
        if(req.isAuthenticated()){
            req.user.isInRole('Admin').then(isAdmin=>{
                if(isAdmin){
                    next();
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/user/login');
        }
    });
    app.get('/admin/user/all',adminController.user.all);
};