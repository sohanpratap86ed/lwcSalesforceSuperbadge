import { LightningElement, wire, api, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { MessageContext, publish, APPLICATION_SCOPE } from 'lightning/messageService';
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
const LOADING_EVENT         = 'loading';
const DONE_LOADING_EVENT    = 'doneloading';


export default class BoatSearchResults extends LightningElement {
  
  @api selectedBoatId;

  columns = [
    { label: 'Name', fieldName: 'Name', type:"text", editable:"true" },
    { label: 'Length', fieldName: 'Length__c', type:"number", editable:"true", minimumIntegerDigits:"0", maximumSignificantDigits:"4" },
    { label: 'Price', fieldName: 'Price__c', type:"currency", editable:"true", currencyCode:"USD" },
    { label: 'Description', fieldName: 'Description__c', type:"text", editable:"true"  }
  ];

  draftValues = [];
  @api boatTypeId = '';
  boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method
  @wire(getBoats, { boatTypeId: '$boatTypeId'})
  wiredBoats(result) {
    if(result){
      this.boats = result;
    }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 

    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);

  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api 
  async refresh() {
    
    this.notifyLoading(true);

    await refreshApex(this.boats).then(() => {

      this.notifyLoading(false);
    
    });
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId

    const payload = { recordId: boatId };

    publish(this.messageContext, BOATMC, payload);

  }
  
  // This method must save the changes in the Boat Editor
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    const recordInputs = event.detail.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });

    //update boat record
    const promises = recordInputs.map(recordInput => updateRecord(recordInput));
            
    Promise.all(promises)
        .then(() => {

          const toastEvent = new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT
        });

        this.dispatchEvent(toastEvent);
        this.refresh();

        })
        .catch(error => {

        const toastEvent = new ShowToastEvent({
            title: ERROR_TITLE,
            message: error,
            variant: ERROR_VARIANT
        });
        
        this.dispatchEvent(toastEvent);

        })
        .finally(() => {});
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 

    const eventName = isLoading ? LOADING_EVENT : DONE_LOADING_EVENT ;
    const loadingEvent = newCustomEvent(eventName);
    this.dispatchEvent(loadingEvent);
    
  }
  
}