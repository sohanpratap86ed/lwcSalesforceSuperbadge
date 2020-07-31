import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c'
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
	@api boatId;
	rating;

	boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField        = NAME_FIELD;
  commentField     = COMMENT_FIELD;
  labelSubject = 'Review Subject';
  labelRating  = 'Rating';


	@api get recordId() {
		return this.boatId;
	}
	set recordId(value) {
		this.boatId = value;
	}

	handleRatingChanged(event) {
		this.rating = event.detail.rating;
	}

	handleSubmit(event) {
		event.preventDefault();
		const fields = event.detail.fields;
		fields.Boat__c = this.boatId;
		fields.Rating__c = this.rating;
		this.template
			.querySelector('lightning-record-edit-form')
			.submit(fields);
	}

	handleSuccess() {
		this.dispatchEvent(
			new ShowToastEvent({
				title: SUCCESS_TITLE,
				variant: SUCCESS_VARIANT
			})
		);
		this.dispatchEvent(new CustomEvent('createreview'));
		this.handleReset();
		
	}

	@api handleReset() { 
		const inputFields = this.template.querySelectorAll(
			'lightning-input-field'
		);
		if (inputFields) {
			inputFields.forEach(field => {
				field.reset();
			});
		}
	}
}