var express = require('express');
var router = new express.Router;
var passport = require('passport');

var identity;

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('info', 'A kért tartalom megtekintéséhez jelentkezzen be!');
    res.redirect('/auth/login');
}

router.route('/auth/login')
    .get(function (req, res) {
		title: 'My App',
        res.render('auth/login');
    })
    .post(passport.authenticate('local-login', {
        successRedirect:    '/list',
        failureRedirect:    '/auth/login',
		title: 'My App',
        failureFlash:       true,
        badRequestMessage:  'Nem megfelelő vagy hiányzó adatok'
    }));

router.route('/auth/signup')
    .get(function (req, res) {
		title: 'Családi ToDo App',
        res.render('auth/signup');
    })
    .post(passport.authenticate('local-signup', {
        successRedirect:    '/add',
        failureRedirect:    '/auth/signup',
		title: 'Családi ToDo App',
        failureFlash:       true,
        badRequestMessage:  'Nem megfelelő vagy hiányzó adatok'
    }));

router.use('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Itt kellene megoldani a végpontokat
router.get('/', function (req, res) {
    res.render('info', {
       title: 'Családi ToDo App'
    });
});

router.route('/list')
    .get(ensureAuthenticated, function (req, res) {
        var result;
        if (req.query.query) {
            var keresettNev = new String(req.query.query);
            result = req.app.Models.teendo.find({
                mit: keresettNev,
                user: req.user.id				 
            });
        } else {
            result = req.app.Models.teendo.find({
                user: req.user.id,
            });
        }
        result
            // Ha nem volt hiba fusson le ez
            .then(function (data) {
                res.render('list', {
                    title: 'Családi ToDo App',
                    data: data,
                    query: req.query.query,
                    uzenetek: req.flash()
                });
            })
            // Ha volt hiba fusson le ez
            .catch(function () {
                console.log('Hiba az oldalon, kérjük próbálja meg később!');
                throw 'error';
            });
		
        //console.log(req.session.data);
    });
    
router.route('/add')
    .get(ensureAuthenticated, function (req, res) {
        res.render('add', {
            title: 'Családi ToDo App',
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('mit', 'Hibás név!')
            .notEmpty();
        req.checkBody('mikor', 'Hibás dátum!')
            .notEmpty()
            .isDate()
            .withMessage('Nem megfelelő dátumformátum');
		req.checkBody('ki', 'Hibás érték!')
            .notEmpty()
            .withMessage('Nem megfelelő érték');
        
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
				req.flash('error', 'Hibás adatok! Kérjük, töltse ki megfelelően a mezőket!');
            });
            res.redirect('/add');
        } else {
			var surg = false;
			if( undefined === req.body.surgos){
				surg = false;
			}else{
				surg = true;
			};
			
            req.app.Models.teendo.create({
                mit: req.body.mit,
                mikor: req.body.mikor,
				ki: req.body.ki,
                surgos: surg,
				user: req.user.id
            })
            .then(function () {
                res.redirect('/add');
                req.flash('success', 'Érték felvétele sikeres!');
            })
            .catch(function () {
                res.redirect('/add');
                req.flash('error', 'Érték felvétele sikertelen!');
            });
		}
    });
    
router.use('/delete/:id', ensureAuthenticated, function (req, res) {
        req.app.Models.teendo.destroy({ id: req.params.id })
        .then(function () {
            res.redirect('/list'); 
            req.flash('success', 'Érték sikeresen törölve');
        })
        .catch(function () {
            res.redirect('/list');
            req.flash('error', 'Üzenet törlése sikertelen');
        });
    });

router.route('/edit/:id')
	.get(ensureAuthenticated, function (req, res) {
        req.app.Models.teendo.findOne({ id: req.params.id })
		.then (function (targy) {
			res.render('edit', {
				title: 'Családi ToDo App',
				uzenetek: req.flash(),
				targy: targy
			})
			identity = req.params.id;
		});
	})
	.post(ensureAuthenticated, function (req, res) {
        req.checkBody('mit', 'Hibás név!')
            .notEmpty();
        req.checkBody('mikor', 'Hibás dátum!')
            .notEmpty()
            .isDate()
            .withMessage('Nem megfelelő dátumformátum');
		req.checkBody('ki', 'Hibás érték!')
            .notEmpty()
            .withMessage('Nem megfelelő érték');
        if (req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
				req.flash('error', 'Hibás adatok! Kérjük, töltse ki megfelelően a mezőket!');
                req.flash('error', error.msg);
            });
            res.redirect('/edit/:id');
        } else {
			var surg = false;
			if( undefined === req.body.surgos){
				surg = false;
			}else{
				surg = true;
			};
			 
			req.app.Models.teendo.update({
				id: identity
				}, {
				mit: req.body.mit,
				mikor: req.body.mikor,
				ki: req.body.ki,
				surgos: surg,
				user: req.user.id,
			})
			.then(function () {
				res.redirect('/list');
				req.flash('success', 'Tárgy módosítása sikeres!');
			})
			.catch(function () {
				res.redirect('/edit/:id');
				req.flash('error', 'Tárgy módosítása sikertelen!');
			});
		}
	});
	
module.exports = router;