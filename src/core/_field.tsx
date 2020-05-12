import {Context, default as React, ReactElement, useContext} from "react";

import {
    getMetadataNameType,
} from "./_helpers";
import {
    FormContext,
    IFormContext,
    METADATA_NAMES,
    TypeFormMetadata,
} from "../form";
import {
    FIELD_NAMES,
} from "../elements";
import {IValidation} from "../validators";
import {FormElementValidators} from "./_components";



/** @internal */
interface IFieldClass<T> {
    create: (context: IFormContext) => ReactElement<T>;
    type: string;
    props: T;
    metadata: TypeFormMetadata;
    bare: boolean;
}

/** @internal */
function _genericFormGroup<T extends any>(props: T, children: any) {
    return (
        <div className="form-group">
            {props.labelText && <label>{props.labelText}</label>}
            {children}
            {props.hint && <small className="form-text text-muted">{props.hint}</small>}
        </div>
    );
}


/** @internal */
abstract class _Field<PropsType extends any> {
    public type: FIELD_NAMES;
    public props: PropsType;
    public parent?: string;
    public _metadata: TypeFormMetadata;
    public _bare: boolean;
    public context: IFormContext;

    protected constructor(props: PropsType, type: FIELD_NAMES) {
        this.type = type;
        this.props = props;
        this.init();
    }

    get bare() {
        return this._bare;
    }

    set bare(val: boolean) {
        this._bare = val;
    }

    get metadata() {
        return this._metadata;
    }

    set metadata(val: TypeFormMetadata) {
        this._metadata = val;
    }

    private init(): void {
        this.context = useContext<IFormContext>(FormContext);
        this.metadata =this.context.metadata[getMetadataNameType(this.type)];
        this.metadata.name = this.props.name;
        this.bare = this.context.bare;
        this.metadata.init();
    }

    public createField(fieldCallback: Function) {
        const _validate = this.metadata.state && this.props.validators ?
            <FormElementValidators
                results={this.doValidation()}
                name={this.props.name}
                value={this.props.value}
                type={getMetadataNameType(this.type)}
                parent={this.parent}
            /> :
            null;

        if (this.bare) {
            return (<>{fieldCallback(this.metadata.state)}{_validate}</>);
        } else {
            return (<>{this.formGroup(fieldCallback(this.metadata.state))}{_validate}</>);
        }
    }

    private doValidation(): Array<IValidation> {
        let validation: Array<IValidation> = [];
        this.props.validators.map((key: any, index: number) => {
            validation = [...validation , this.props.validators[index](this.props.value, this.context)];
        });

        // Update the metadata type state
        this.metadata.update(this.props, validation);
        return validation;
    }

    public abstract formGroup(children: any): ReactElement;

    public abstract getField(): (context: IFormContext) => ReactElement;

    static mergeDefaultCssWithProps(defaultValue: string, cssProps: any, bare: boolean): string {
        let cssStr = "";
        if (!bare) {
            cssStr += `${defaultValue} `;
        }
        if (cssProps) {
            cssStr += `${cssProps}`;
        }
        return cssStr;
    }

    public overrideEvent(e: any, value: any) {
        return {
            ...e,
            target: {
                ...e.target,
                value: !value,
            }
        }
    }
}

/** @internal */
export class InputField<T extends any> extends _Field<T> implements IFieldClass<T> {

    constructor(type: FIELD_NAMES, props: T) {
        super(props, type);
        this.type = type;
        this.props = props;
    }

    public create() {
        return this.createField(this.getField());
    }

    public formGroup(children: any): ReactElement {
        return _genericFormGroup<T>(this.props, children);
    }

    public getField() {

        return (context: IFormContext) => {
            return <>{this.metadata.state && <input
                type={this.type}
                value={this.context.state[this.props.name as T]|| ""}
                onChange={(e) => this.context.updateParentState(e, this.props.name)}
                name={this.props.name}
                className={_Field.mergeDefaultCssWithProps("form-control", this.props.className, context.bare)}
            />}</>;
        }
    }
}

// /** @internal */
// export class CheckBoxField<T extends any> extends _Field<T> implements IFieldClass<T> {
//
//     constructor(type: FIELD_NAMES, props: T) {
//         super(props, type);
//         this.type = type;
//         this.props = props;
//     }
//
//     public create() {
//         return this.createField(this.getField());
//     }
//
//     public formGroup(children: any): ReactElement {
//         return (
//             <div className="form-group form-check">
//                 {children}
//                 {this.props.labelText && <label className="form-check-label">{this.props.labelText}</label>}
//                 {this.props.hint && <small className="form-text text-muted">{this.props.hint}</small>}
//             </div>
//         );
//     }
//
//     public getField() {
//         return (context: IFormContext) => {
//             return <input
//                 type={this.type}
//                 checked={context.state[this.props.name] || false}
//                 onChange={(e) => context.updateParentState(this.overrideEvent(e, context.state[this.props.name]), this.props.name)}
//                 name={this.props.name}
//                 className={_Field.mergeDefaultCssWithProps("form-check-input", this.props.className, context.bare)}
//             />;
//         }
//     }
// }
//
// /** @internal */
// export class TextAreaField<T extends any> extends _Field<T> implements IFieldClass<T> {
//     constructor(type: FIELD_NAMES, props: T) {
//         super(props, type);
//         this.type = type;
//         this.props = props;
//     }
//
//     public create() {
//         return this.createField(this.getField());
//     }
//
//     public formGroup(children: any): ReactElement {
//         return _genericFormGroup<T>(this.props, children);
//     }
//
//     public getField() {
//         const {rows = 5} = this.props;
//         return (context: IFormContext) => {
//             return (
//                 <textarea
//                     className={mergeDefaultCssWithProps("form-control", this.props.className, context.bare)}
//                     rows={rows}
//                     value={context.state[this.props.name] || ""}
//                     onChange={(e) => context.updateParentState(e, this.props.name)}
//                     name={this.props.name}
//                 />
//             );
//         }
//     }
// }
//
// /** @internal */
// export class RadioField<T extends any> extends _Field<T> implements IFieldClass<T> {
//     public parent: string;
//     constructor(type: FIELD_NAMES, props: T) {
//         super(props, type);
//         this.type = type;
//         this.props = props;
//     }
//
//     public create() {
//         return this.createField(this.getField());
//     }
//
//     public formGroup(children: any): ReactElement {
//         return (
//             <div className="form-group form-check">
//                 {children}
//                 {this.props.labelText && <label className="form-check-label">{this.props.labelText}</label>}
//                 {this.props.hint && <small className="form-text text-muted">{this.props.hint}</small>}
//             </div>
//         );
//     }
//
//     public getField() {
//         const test = () => {
//             console.log()
//         };
//         const radioContext: IRadioGroupParentContext = useContext(RadioGroupContext);
//         this.parent = radioContext.parent.name;
//         return (context: IFormContext) => {
//             return <input
//                 type={this.type}
//                 checked={context.state[this.props.name] || false}
//                 name={this.props.name}
//                 onChange={test}
//                 className={_Field.mergeDefaultCssWithProps("form-check-input", this.props.className, context.bare)}
//             />
//         }
//     }
// }
//
// /** @internal */
// export class SelectField<T extends any> extends _Field<T> implements IFieldClass<T> {
//
//     constructor(type: FIELD_NAMES, props: T) {
//         super(props, type);
//         this.type = type;
//         this.props = props;
//     }
//
//     public create() {
//         return this.createField(this.getField());
//     }
//
//     public formGroup(children: any): ReactElement {
//         return _genericFormGroup<T>(this.props, children);
//     }
//
//     public getField() {
//         const {options = [], size = "default"} = this.props;
//         return (context: IFormContext) => {
//
//             return (
//                 <select
//                     onChange={(e) => context.updateParentState(e, this.props.name)}
//                     name={this.props.name}
//                     className={_Field.mergeDefaultCssWithProps(this.getSelectCssName(this.props.size), this.props.className, context.bare)}
//                 >
//                     {options.map((optVal: string, i: number) => {
//                         return <option value={optVal} key={i}>{optVal}</option>
//                     })}
//                 </select>
//             );
//         }
//     }
//
//     private getSelectCssName(name: TypeSelectCssSizeName) {
//         if(name === "default") {
//             return "form-control"
//         } else {
//             return `form-control form-control-${name}`;
//         }
//     }
// }
//
// /** @internal */
// export class FileField<T extends any> extends _Field<T> implements IFieldClass<T> {
//
//     constructor(type: FIELD_NAMES, props: T) {
//         super(props, type);
//         this.type = type;
//         this.props = props;
//     }
//
//     public create() {
//         return this.createField(this.getField());
//     }
//
//     public formGroup(children: any): ReactElement {
//         return _genericFormGroup<T>(this.props, children);
//     }
//
//     public getField() {
//         const updateFieldValidation = (e: React.ChangeEvent<HTMLInputElement>, context: IFormContext) => {
//             const file = createFileObject(this.props.ref);
//             context.updateMetadata(this.props.name, file, null, "files")
//         };
//         return (context: IFormContext) => {
//             return (<input
//                 ref={this.props.ref}
//                 type="file"
//                 onChange={(e) => updateFieldValidation(e, context)}
//                 className={_Field.mergeDefaultCssWithProps("form-control-file", this.props.className, context.bare)}
//             />);
//         }
//     }
// }
