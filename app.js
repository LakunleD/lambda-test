'use strict';
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
let response;

let collectionName = 'bookCollection';


function getResponse(message) {
    return {
        'statusCode': 200,
        'body': message
    };
}

const addBook = (booksCollection, body) => {
    let data = JSON.parse(body);

    return new Promise((resolve, reject) => {
        booksCollection.insertOne(data, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

const getAllBooks = (booksCollection) => {
    return new Promise((resolve, reject) => {
        booksCollection.find({}).toArray((err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

const getBook = (booksCollection, bookId) => {
    return new Promise((resolve, reject) => {
        booksCollection.findOne({_id: new ObjectID(bookId)}, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

const updateBook = (booksCollection, bookId, data) => {
    return new Promise((resolve, reject) => {
        booksCollection.findOne({_id: new ObjectID(bookId)}, (err, res) => {
            if (err) {
                reject(err);
            }
            if (!res) {
                resolve(res);
            }
            if (data.name) {
                res.name = data.name;
            }
            if (data.author) {
                res.author = data.author;
            }
            if (data.rating) {
                res.rating = data.rating;
            }
            booksCollection.updateOne({_id: bookId}, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    });
};

const deleteBook = (booksCollection, bookId) => {
    return new Promise((resolve, reject) => {
        booksCollection.deleteOne({_id: bookId}, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

const handler = async (event, context, callback) => {
    try {

    }
    catch (err) {
        console.log(err);
        callback(err, null);
    }

    let uri = 'mongodb://lakunled:asdfgh12@ds119088.mlab.com:19088/books';
    // let uri = 'mongodb://localhost:27017/';

    MongoClient.connect(uri, {useNewUrlParser: true}).then(
        (databaseConnection) => {
            console.log("Connected to Database Successfully.");
            let booksCollection = databaseConnection.db('books').collection(collectionName);

            switch (event.httpMethod) {
                case 'POST':
                    let data = event.body;
                    addBook(booksCollection, data)
                        .then((res) => {
                            if (res.n === 1) {
                                databaseConnection.close();
                                response = getResponse('Record Inserted');
                            }
                            else {
                                databaseConnection.close();
                                response = getResponse('An error occured, record was\'t inserted.');
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            callback(err, null);
                        });
                    break;
                case 'GET':
                    let params = event.pathParameters;
                    if (params !== null) {
                        getBook(booksCollection, params.BookId)
                            .then((res) => {
                                databaseConnection.close();
                                console.log(res);
                                response = getResponse(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                callback(err, null);
                            });
                    }
                    else {
                        getAllBooks(booksCollection)
                            .then((res) => {
                                databaseConnection.close();
                                response = getResponse(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                callback(err, null);
                            });
                    }
                    break;
                case 'PUT':
                    let urlParams = event.pathParameters;
                    if (urlParams !== null) {
                        updateBook(booksCollection, params.BookId)
                            .then((res) => {
                                databaseConnection.close();
                                response = getResponse(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                callback(err, null);
                            });
                    }
                    break;
                case 'DELETE':
                    let urlParam = event.pathParameters;
                    if (urlParam !== null) {
                        deleteBook(booksCollection, params.BookId)
                            .then((res) => {
                                databaseConnection.close();
                                response = getResponse(res);
                            })
                            .catch((err) => {
                                console.log(err);
                                callback(err, null);
                            });
                    }
                    break;
                default:
                    response = getResponse('Method not implemented');
                    break;
            }

        }
    ).catch((err) => {
        console.log(err);
        callback(err, null);
    });

    // callback(null, response)
    context.succeed(response);
};

module.exports = {
    handler
};