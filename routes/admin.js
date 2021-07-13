const express = require('express')
const adminRouter = express.Router()
const { db } = require('../app')


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
  db.posts.find({}, (err, data) => {
    res.render('admin/home', { layout: false, posts: data })
  })

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
      db.posts.findOne({ _id: req.params.id }, (err, data) => {
        res.render('admin/post', { layout: false, post: data })
      })

    } else {
      return res.redirect('/admin')
    }
  } catch (error) {

  }
})

adminRouter.get('/search', isLoggedIn, async (req, res) => {
  try {
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
        res.render('admin/home', { layout: false, posts: newPosts })
      } else {
        return res.render('admin/home', { layout: false, posts })
      }
    })
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

    
    let post = {
      description: {
        full: description,
      },
      title: {
        full: title,
        small: title.length > 56 ? `${title.substr(0, 56)}...` : title
      },
      image: image,
    }
    
    db.posts.insert(post,(err,data)=>{
      res.redirect('/admin')
    })

  } catch (error) {
  }
})

adminRouter.get('/edit-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
    return res.redirect('/admin')
  }
  db.posts.findOne({_id:req.params.id},(err,post)=>{
    if (!post || post === undefined || post === null) {
      return res.redirect('/admin')
    }
    res.render('admin/edit-post', { layout: false, post })
  })
})

adminRouter.post('/edit-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
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
        _id: req.params.id
      }
    })
  }
  
  let newPost = {
    description: {
      full: req.body.content,
    },
    title: {
      full: req.body.title,
      small: req.body.title.length > 56 ? `${req.body.title.substr(0, 56)}...` : req.body.title
    },
    image: req.body.thumbnail,
    _id: req.params.id
  }

  db.posts.update({_id:req.params.id},newPost,{},(err,data)=>{
    res.redirect('/admin')
  })


})



adminRouter.get('/delete-post/:id', isLoggedIn, async (req, res) => {
  if (!req.params.id) {
    return res.redirect('/admin')
  }

  db.posts.remove({_id:req.params.id},{},(err,data)=>{
    res.redirect('/admin')
  })
})



adminRouter.get('/edit-about', isLoggedIn, async (req, res) => {
  db.about.find({},(err,data)=>{
    let about = data[0]
    res.render('admin/edit-about', { layout: false, title: about.title, content: about.description, contact: about.contact,_id:about._id })
  })
})

adminRouter.post('/edit-about', isLoggedIn, async (req, res) => {
  if (!req.body || !req.body.title || !req.body.contact || !req.body.content || !req.body._id) {
    return res.render('admin/edit-about', { err: "Please fill all the fields !", layout: false, title: req.body.title, content: req.body.content, contact: req.body.contact ,_id:req.body._id})
  }



  let about = {
    title: req.body.title,
    description: req.body.content,
    contact: req.body.contact,
    _id:req.body._id
  }

  db.about.update({_id:req.body._id},about,{},(err,data)=>{
    res.redirect('/admin')
  })
})



adminRouter.get('/settings', isLoggedIn, async (req, res) => {
  res.render('admin/settings', { layout: false })
})


adminRouter.get('/logout', isLoggedIn, async (req, res) => {
  req.session.user = false
  res.redirect('/admin')
})

module.exports = adminRouter