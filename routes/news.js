const express = require('express')
const fs = require('fs')
const newsRouter = express.Router()
const path = require('path')
const open = require('open')



newsRouter.get('/', async (req, res) => {
    let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
    res.render('news', { posts, layout: false })
})

newsRouter.get('/post/:id', async (req, res) => {
    if (req.params.id) {

        let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))

        let post = posts.find(post => req.params.id == post.id)

        res.render('newsSingle', { layout: false, post })

    } else {
        return res.redirect('/')
    }


})

newsRouter.get('/search', async (req, res) => {
    let search = req.query.q
    let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
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

newsRouter.get('/about', async (req, res) => {
    let about = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'about.json'), 'utf8'))
    res.render('about', { layout: false, about })
})


newsRouter.get('/contact', async (req, res) => {
    let about = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'about.json'), 'utf8'))
    open(about.contact, function (err) {
        if (err) return res.redirect('/')
    })
    res.redirect('back')
})

module.exports = newsRouter
