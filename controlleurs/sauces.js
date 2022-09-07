const Sauce= require('../models/Sauce');


const fs = require("fs");
const { serialize } = require('v8');

exports.createSauce = (req, res, next) => {
  //console.log(req.body.sauce);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  //console.log(sauceObject);
  const sauce = new Sauce({
      userId: req.auth.userId,
      name: sauceObject.name,
      manufacturer: sauceObject.manufacturer,
      description: sauceObject.description,
      mainPepper: sauceObject.description,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      heat: sauceObject.heat,
      likes: 0,
      dislikes: 0
  });
  //console.log(sauce);
  sauce
  .save()
  .then(() => res.status(201).json({message : "Objet enregistré"}))
  .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
      _id: req.params.id
    }).then(
      (sauce) => {
        res.status(200).json(sauce);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauce) => {
        res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
        res.status(400).json({
            error: error
        });
        }
    );
};
/*
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` 
  } : { ...req.body }
  delete sauceObject._userId;

  Sauce.findOne({_id: req.params._id})
    .then((sauce) => {
      if(sauce.userId != req.auth.userId) {
        res.status(401).json({message: "Modification non-autorisé"});
      } else {
        Sauce.updateOne({
          _id: req.params.id
        }, {
          ...sauceObject, 
          _id: req.params.id
        })
          .then(() => res.status(200).json({message: "Sauce modifier"}))
          .catch(error => res.status(401).json({error}))
          console.log(Sauce);
      }
    })
    .catch((error) => {res.status(400).json({error})
  })
}*/

exports.modifySauce = (req, res, next) => {
  try {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (!sauce) {
        res.status(404).json({
          error: new Error("sauce non trouvée"),
        });
      } else if (sauce.userId !== req.auth.userId) {
        res.status(403).json({
          error: new Error("403: unauthorized request"),
        });
      } else {
        if (req.file) {
          delFile(req.params.id); //On supprime l'ancien fichier de l'image
        }
        const sauceObject = req.file //Test si nouvelle image ou pas
          ? //1ier cas: nouvelle image on récupère son URL

            {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            }
          : //2ieme cas: pas de nouvelle image: copie du body
            { ...req.body };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
  } catch {
    res.status(500).json({
      error: new Error("Erreur server"),
    });
  }
};


exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({_id: req.params.id})
    .then(() => {res.status(200).json({message: 'Sauce supprimer'})})
    .catch((error) => {res.status(400).json({error: error})})
}

