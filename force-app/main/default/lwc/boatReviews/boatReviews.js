import { LightningElement, track, api }     from 'lwc';
import { NavigationMixin }                  from 'lightning/navigation';
import { ShowToastEvent }                   from 'lightning/platformShowToastEvent';
import getAllReviews                        from '@salesforce/apex/BoatDataService.getAllReviews';


const TOAST_ERROR_TITLE     = 'Error Boat Reviews';
const TOAST_ERROR_VARIANT   = 'error';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    @track
    boatId;

    error;
    boatReviews = [];
    isLoading;

    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        //sets boatId assignment
        this.boatId = value;
        //sets boatId attribute
        this.setAttribute('boatId', value);
        //get reviews associated with boatId
        this.getReviews();
    }

    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        return this.boatReviews.length > 0;
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
    }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (!this.boatId) return;
        this.isLoading = true;
        getAllReviews({
            boatId: this.boatId
        })
            .then(reviews => {
                if (reviews)
                    this.boatReviews = reviews;
            })
            .catch(error => {
                this.error = error;
                const toastEventError = new ShowToastEvent({
                    title: TOAST_ERROR_TITLE,
                    message: this.error.body.message,
                    variant: TOAST_ERROR_VARIANT
                });
                this.dispatchEvent(toastEventError);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
        event.preventDefault();
        event.stopPropagation();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.dataset.recordId,
                objectApiName: 'BoatReview__c',
                actionName: 'view'
            }
        });
    }
}