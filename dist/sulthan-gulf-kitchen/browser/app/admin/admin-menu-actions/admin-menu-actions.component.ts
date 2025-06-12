import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Storage } from '@angular/fire/storage';
import { MainService } from '../../services/main.service';
import { environment } from '../../../environment';


@Component({
  selector: 'app-admin-menu-actions',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-menu-actions.component.html',
  styleUrl: './admin-menu-actions.component.scss'
})
export class AdminMenuActionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private storage = inject(Storage);
  private _mainService = inject(MainService);
  MenuDetaiForm!: FormGroup;
  SizeOptions = [
    {name: 'Quater', value: 'Q', isChecked: true, isDisabled: false}, 
    {name: 'Half', value: 'H', isChecked: false, isDisabled: false}, 
    {name: 'Full', value: 'F', isChecked: false, isDisabled: false}
  ];
  MenuTypes = [{name: 'Party Order', value: 'P'}, {name: 'Retail Order', value: 'R'}];
  PriorityTypes = [{name: 'Normal', value: 'N'}, {name: 'High', value: 'H'}];
  Cusines = ['arabic', 'indian', 'biriyani', 'curry', 'addons'];
  AllowedSizes = 3;
  ImageError = false;
  TempImageStorage: {fileName: string, index: number}[] = [];
  @Input() IsEditMode = false;
  @Input() PreviousData!: any;
  @Output() IsMenuModified = new EventEmitter<void>();

  constructor() {
    
  }

  ngOnInit(): void {
    if (this.PreviousData) {
      this.MenuDetaiForm = this.fb.group({
        name: new FormControl(this.PreviousData.name, Validators.required),
        type: new FormControl(this.PreviousData.type, Validators.required),
        priority: new FormControl(this.PreviousData.priority, Validators.required),
        cusine: new FormControl(this.PreviousData.cusine, Validators.required),
        sizevar: this.fb.array([])
      });
      this.PreviousData.sizevar.forEach((datum: any) => {
        this.addItem(null, datum.price, datum.description, datum.serves)
      });
    }
    else {
      this.MenuDetaiForm = this.fb.group({
        name: new FormControl('', Validators.required),
        type: new FormControl(this.MenuTypes[0].value, Validators.required),
        priority: new FormControl(this.PriorityTypes[0].value, Validators.required),
        cusine: new FormControl(this.Cusines[0], Validators.required),
        sizevar: this.fb.array([this.createItem(null, '', this.SizeOptions[0].value, '')])
      });
    }
  }

  createItem = (image: any, price: string, des: string, serves: string)  => this.fb.group({ image: image, price: price, description: des, serves: serves}, Validators.requiredTrue);

  get items(): FormArray {  
    return this.MenuDetaiForm.get('sizevar') as FormArray;
  }

  addItem = (image: any, price: string, des: string, serves: string) => {
    this.AllowedSizes -= 1;
    this.items.push(this.createItem(image, price, des, serves));
  }

  removeItem = (index: number) => {
    this.AllowedSizes += 1;
    this.items.removeAt(index);
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.items.at(index).patchValue({ image: file });
    }
    if (this.IsEditMode) {
      this.TempImageStorage.push({
        fileName: this.PreviousData.sizevar[index].fileName,
        index: index
      });
    }
  }

  updateMenuData(formValues: any) {
    const modifiedDate = new Date().toLocaleDateString('en-GB');
    formValues.modifiedDate = modifiedDate;
    formValues.createdDate = this.PreviousData.createdDate;
    formValues.id = this.PreviousData.id;
    this._mainService.updateData(environment.foodMenuColl, this.PreviousData.id, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Menu updated sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not updated.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  addMenuData(formValues: any) {
    const createdDate = new Date().toLocaleDateString('en-GB');
    formValues.createdDate = createdDate;
    formValues.modifiedDate = null;
    this._mainService.addData(environment.foodMenuColl, formValues)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Menu added sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  async uploadAllImages(folder: string) {
    this._mainService.IsLoading = true;
    const fileNames: string[] = [];
    const imageUrls: string[] = [];
    const uploadPromises = this.items.controls.map(async (group, index) => {
      const file: File = group.get('image')?.value;
      if (file) {
        const path = `${folder}/${file.name}`;
        fileNames.push(file.name);
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(this.removeTokenFromUrl(downloadURL));
        this._mainService.IsLoading = false;
        return {
          url: imageUrls,
          fileName: fileNames
        };
      }
      this._mainService.IsLoading = false;
      return {
        url: [],
        fileName: []
      };
    });
  
    const urls = await Promise.all(uploadPromises);
    this._mainService.IsLoading = false;
    return urls;
  }

  removeTokenFromUrl(url: string): string {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.delete('token');
    return parsedUrl.toString();
  }

  onSubmit() {
    var formValues = this.MenuDetaiForm.value;
    this.uploadAllImages(formValues.cusine).then((res: any) => {
      formValues.sizevar.forEach((val: any, index: number) => {
        val.image = res[0].url[index] ? res[0].url[index] : '';
        val.fileName = res[0].fileName[index] ? res[0].fileName[index] : '';
      });
      if (!this.IsEditMode) {
        this.addMenuData(formValues);
        this.TempImageStorage = [];
      }
      else {
        this.deleteFile(this.TempImageStorage, formValues.cusine).then(() => this.updateMenuData(formValues))
        .catch(() => {
          this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not updated.</div>`;
          this._mainService.hideSnackBar(5000);
        });
        this.TempImageStorage = [];
      }
    });
    this.IsMenuModified.emit();
  }

  deleteRecord() {
    this._mainService.deleteData(environment.foodMenuColl, this.PreviousData.id)
    .then(docRef => {
      this._mainService.AlertText = `<div class="alert alert-success" role="alert">Menu deleted sucessfully</div>`;
      this._mainService.hideSnackBar(3000);
    })
    .catch(error => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong.</div>`;
      this._mainService.hideSnackBar(5000);
    });
  }

  async deleteFile(data: any, cusine: string) {
    if (data.length > 0) {
      data.forEach(async (datum: any) => {
        const constructedPath = `${cusine}/${datum.fileName}`;
        const fileRef = ref(this.storage, constructedPath);
        await deleteObject(fileRef);
      });
    }
  }

  onDeleteItem() {
    this.deleteFile(this.PreviousData.sizevar, this.PreviousData.cusine).then(() => this.deleteRecord())
    .catch(() => {
      this._mainService.AlertText = `<div class="alert alert-danger" role="alert"> Woops! Something wrong, Data not inserted.</div>`;
      this._mainService.hideSnackBar(5000);
    });
    this.IsMenuModified.emit();
  }
}
