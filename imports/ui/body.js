import { Template } from 'meteor/templating';

import { Questions } from '../api/questions.js';

import './body.html';

Session.set("upVotedQs", new Array());
Session.set("downVotedQs", new Array());
var upVotedQsTemp = new Array();
var downVotedQsTemp = new Array();
var myQstemp = new Array();

// Parameters for the Toast feature (i.e, the message that pops up when a Q is submitted)
// http://codeseven.github.io/toastr/demo.html
Toast.options = {
  closeButton: true,
  progressBar: true,
  positionClass: 'left',
  showEasing: 'swing',
  hideEasing: 'swing',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
  timeOut: 750,
};

if (Meteor.isServer){
//	Questions._ensureIndex({ type:'text', index:{ fields:[{name: 'questionText', type: 'string'},{name: 'upVote',type: 'number'}]}});
}



Template.body.helpers({
  questions() {
    return Questions.find();
		}
});

Template.question.helpers({
  whenCreated() {
    return moment(this.createdAt).fromNow();
  }
});

Template.question.events({
	'click #delete-question': function(){
		// Allow Delete only if it is your Question from this session
		if($.inArray(this._id,myQstemp) == -1){  
			Toast.error('Not authorized');
			return false;
		}
		var idToBeRemoved = this._id;
		Questions.remove({_id: this._id});
		myQstemp.splice($.inArray(idToBeRemoved, myQstemp),1);  // Remove the item from the Array
	},

	'mouseenter #upVote': function(){
		console.log("You moved your mouse over the upVote icon");
	},

	'click #upVote': function(){
		upVotedQsTemp = Session.get("upVotedQs");  //First get the upVotedQs array into temp Array

		/*  Check if current upVoted Question is already upVoted 
		(i.e.,check if the Question was previously liked in this session)
		Increment the upVoteCounter only if the Question was not liked before in this session.
		*/
		if($.inArray(this._id,upVotedQsTemp) == -1){   // -1 means it is not found int the Array
		Questions.update(
			{_id: this._id}, 

			{
				$inc: {upVoteCounter: 1}			
			});
		
		upVotedQsTemp.push(this._id);     // Add the current Liked Question(upVoted Question) to temp Array
		Session.set("upVotedQs",upVotedQsTemp); // Save the temp Array in the Session
		}
		else {  // means it has already been upVoted once in this session
			Questions.update(  // decrease the upVote count in Database
				{_id: this._id},
				{
					$inc: {upVoteCounter: -1}
				});

			upVotedQsTemp.splice($.inArray(this._id, upVotedQsTemp),1);  // Remove the item from the Array
			Session.set("upVotedQs",upVotedQsTemp);

			return false;

		};
	},

	'click #downVote': function(){	
		/* Refer to the logic in 'click #upVote', the downVote also follows a similar logic */

		downVotedQsTemp = Session.get("downVotedQs");

		if($.inArray(this._id,downVotedQsTemp) == -1){

		Questions.update(
			{_id: this._id}, 

			{
				$inc: {downVoteCounter: 1}			
			});
			downVotedQsTemp.push(this._id);
			Session.set("downVotedQs",downVotedQsTemp);
		}
		else {  // means it has already been downVoted once in this session
			Questions.update(  // decrease the downVote count in Database
				{_id: this._id},
				{
					$inc: {downVoteCounter: -1}
				});

			downVotedQsTemp.splice($.inArray(this._id, downVotedQsTemp),1);  // Remove the item from the Array
			Session.set("downVotedQs",downVotedQsTemp);

			return false;

		};
	}
});


Template.body.events({
	'submit .add-question': function(event){
		event.preventDefault();

		QtoInsert = {
			questionText: $(event.target).find('[name=questionText1]').val(), 
			createdAt : new Date(),
			upVoteCounter: 0,
			downVoteCounter: 0
		};

		Questions.insert(QtoInsert, function(err,idInserted){
    		if (err) { 
    		console.log(err + "is the error");
    			return;
    		}else{
    		// Question inserted successfully. Let us add the Question ID to the temp Array.
    		myQstemp.push(idInserted);
    		}
		});

		Toast.info('Thank You for the Question !');

		/* Refer to this http://codeseven.github.io/toastr/demo.html */

		event.target.reset();
	}

});