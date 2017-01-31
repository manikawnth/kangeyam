function authorizePublish(client, topic, payload, cb) {
  console.log('Authorizing');
  console.log(client.id);
  console.log(topic);
  cb(null, true);
}

module.exports = authorizePublish;
