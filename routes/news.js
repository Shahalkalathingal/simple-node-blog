const express = require('express')
const newsRouter = express.Router()
const {db} = require('../app')



newsRouter.get('/', async (req, res) => {
    
    db.posts.find({},(err,data)=>{
       res.render('news', { posts:data, layout: false })
   })
})

newsRouter.get('/post/:id', async (req, res) => {
    if (req.params.id) {

       db.posts.findOne({_id:req.params.id},(err,data)=>{
           res.render('newsSingle', { layout: false, post:data })
       })

    } else {
        return res.redirect('/')
    }


})

newsRouter.get('/search', async (req, res) => {
    let search = req.query.q
    db.posts.find({},(err,posts)=>{
        if (search) {
            let newPosts = posts.filter(post => {
                let title = post.title.full.toLowerCase()
                let q = search.toLowerCase()
                if (title.includes(q)) {
                    return post
                }
            })
            res.render('news', { layout: false, posts: newPosts })
        } else {
            return res.render('news', { layout: false, posts })
        }
    })

})

newsRouter.get('/about', async (req, res) => {
    db.about.find({},(err,data)=>{
        res.render('about', { layout: false, about:data[0] })
    })
})


newsRouter.get('/contact', async (req, res) => {
    db.about.find({},(err,data)=>{
        res.redirect(data[0].contact)
    })
})

module.exports = newsRouter
