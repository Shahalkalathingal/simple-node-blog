const express = require('express')
const adminRouter = express.Router()
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')

const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

const isNotLoggedIn = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/admin')
  } else {
    next()
  }
}

// Routes

adminRouter.get('/', isLoggedIn, async (req, res) => {
  let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
  res.render('admin/home', { layout: false, posts })

})

adminRouter.get('/login', isNotLoggedIn, async (req, res) => {
  res.render('admin/login', { layout: false })
})


adminRouter.post('/login', isNotLoggedIn, async (req, res) => {
  try {

    if (!req.body || !req.body.uname || !req.body.psw) {
      return res.redirect('/admin')
    }
    const { uname: username, psw: password } = req.body
    if (username != process.env.USERNAME) {
      return res.render('admin/login', { layout: false, err: "Invalid username or password !", password, username })
    }
    if (password != process.env.PASSWORD) {
      return res.render('admin/login', { layout: false, err: "Invalid username or password !", password, username })
    }

    req.session.user = { username, password }
    res.redirect('/admin')

  } catch (error) {

  }
})


adminRouter.get('/post/:id', isLoggedIn, async (req, res) => {
  try {
    if (req.params.id) {
      let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
      let post = posts.find(post => req.params.id == post.id)

      res.render('admin/post', { layout: false, post })

    } else {
      return res.redirect('/admin')
    }
  } catch (error) {

  }
})

adminRouter.get('/search', isLoggedIn, async (req, res) => {
  try {
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
      res.render('admin/home', { layout: false, posts: newPosts })
    } else {
      return res.render('admin/home', { layout: false, posts })
    }
  } catch (error) {

  }
})

adminRouter.get('/compose', isLoggedIn, async (req, res) => {
  res.render('admin/compose', { layout: false })
})


adminRouter.post('/compose', isLoggedIn, async (req, res) => {

  if (!req.body || !req.body.title || !req.body.thumbnail || !req.body.content) {
    return res.render('admin/compose', { layout: false, err: "Please fill all the fields !", title: req.body.title, content: req.body.content, thumbnail: req.body.thumbnail })
  }
  try {
    const { title, thumbnail: image, content: description } = req.body

    let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))

    let post = {
      description: {
        full: description,
      },
      title: {
        full: title,
        small: title.length > 56 ? `${title.substr(0, 56)}...` : title
      },
      image: image,
      id: uuid.v4()
    }
    posts.push(post)


    fs.writeFile(path.resolve(`${__dirname}/..`, 'posts.json'), JSON.stringify(posts), 'utf8', function (err) {
      res.redirect('/admin')
    })

  } catch (error) {
  }
})

adminRouter.get('/edit-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
    return res.redirect('/admin')
  }
  let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
  let post = posts.find(post => post.id == req.params.id)
  if (!post || post === undefined || post === null) {
    return res.redirect('/admin')
  }
  res.render('admin/edit-post', { layout: false, post })
})

adminRouter.post('/edit-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
    return res.redirect('/admin')
  }
  let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
  let post = posts.find(post => post.id == req.params.id)
  if (!post || post === undefined || post === null) {
    return res.redirect('/admin')
  }
  if (!req.body || !req.body.title || !req.body.thumbnail || !req.body.content) {
    return res.render('admin/edit-post', {
      layout: false, err: "Please fill all the fields !", post: {
        title: {
          full: req.body.title,
          small: post.title.small
        },
        description: {
          full: req.body.content
        },
        image: req.body.thumbnail,
        id: req.params.id
      }
    })
  }
  let newPosts = posts.filter(post => post.id != req.params.id)
  let newPost = {
    description: {
      full: req.body.content,
    },
    title: {
      full: req.body.title,
      small: req.body.title.length > 56 ? `${req.body.title.substr(0, 56)}...` : req.body.title
    },
    image: req.body.thumbnail,
    id: req.params.id
  }
  newPosts.push(newPost)
  fs.writeFile(path.resolve(`${__dirname}/..`, 'posts.json'), JSON.stringify(newPosts), 'utf8', function (err) {
    res.redirect('/admin')
  })
})



adminRouter.get('/delete-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
    return res.redirect('/admin')
  }

  let posts = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'posts.json'), 'utf8'))
  let post = posts.find(post => post.id == req.params.id)
  if (!post || post === undefined || post === null) {
    return res.redirect('/admin')
  }
  let newPosts = posts.filter(post => post.id != req.params.id)
  fs.writeFile(path.resolve(`${__dirname}/..`, 'posts.json'), JSON.stringify(newPosts), 'utf8', function (err) {
    res.redirect('/admin')
  })
})



adminRouter.get('/edit-about', isLoggedIn, async (req, res) => {
  let about = JSON.parse(fs.readFileSync(path.resolve(`${__dirname}/..`, 'about.json'), 'utf8'))
  res.render('admin/edit-about', { layout: false, title: about.title, content: about.description, contact: about.contact })
})

adminRouter.post('/edit-about', isLoggedIn, async (req, res) => {
  if (!req.body || !req.body.title || !req.body.contact || !req.body.content) {
    return res.render('admin/edit-about', {err:"Please fill all the fields !", layout: false, title: req.body.title, content: req.body.content, contact: req.body.contact })
  }
  let about = {
    title: req.body.title,
    description: req.body.content,
    contact: req.body.contact
  }
  fs.writeFile(path.resolve(`${__dirname}/..`, 'about.json'), JSON.stringify(about), 'utf8', function (err) {
    res.redirect('/admin')
  })
})



adminRouter.get('/settings',isLoggedIn,async(req,res)=>{
  res.render('admin/settings',{layout:false})
})


adminRouter.get('/logout',isLoggedIn,async(req,res)=>{
  req.session.user = false
  res.redirect('/admin')
})

module.exports = adminRouter