import { LightningElement, track, wire, api }        from 'lwc';
//import BoatReviews                              from 'c/boatReviews';
import { getRecord, getFieldValue }             from 'lightning/uiRecordApi';
import { NavigationMixin }                      from 'lightning/navigation';
import BOATMC                                   from '@salesforce/messageChannel/BoatMessageChannel__c';
import { 
    MessageContext, 
    subscribe, 
    APPLICATION_SCOPE }                         from 'lightning/messageService';
import BOAT_OBJECT                              from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD                            from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD                          from '@salesforce/schema/Boat__c.Name';
import labelDetails                             from '@salesforce/label/c.Details';
import labelReviews                             from '@salesforce/label/c.Reviews';
import labelAddReview                           from '@salesforce/label/c.Add_Review';
import labelFullDetails                         from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat                   from '@salesforce/label/c.Please_select_a_boat';



// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    
    @api boatId;

    @wire (getRecord, { recordId: '$boatId' , fields: BOAT_FIELDS })
    wiredRecord;


    @wire(MessageContext)
    messageContext;


    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat
    };

    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord ? 'utility:anchor' : null;
     }

    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() {
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
     }

    // Private
    @track
    subscription = null;

    

    // Subscribe to the message channel
    subscribeMC() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BOATMC,
                (message) => this.boatId = message.recordId,
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }

    // Navigates to record page
    navigateToRecordViewPage() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: BOAT_OBJECT,
                actionName: 'view'
            }
        });
    }

    // Navigates back to the review list, and refreshes component
    handleReviewCreated() {
        this.template.querySelector('lightning-tabset').activeTabValue = 'Reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}