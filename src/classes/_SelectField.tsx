import {default as React} from "react";

import {_genericFormGroup, AbstractField, IAbstractField} from "./_AbstractField";
import {FIELD_NAMES, TypeSelectCssSizeName} from "../elements";


/** @internal */
export class SelectField<T extends any> extends AbstractField<T> implements IAbstractField<T> {

    constructor(type: FIELD_NAMES, props: T) {
        super(props, type);
        this.type = type;
        this.props = props;
    }

    public create() {
        return this.createField(this.getField());
    }

    public formGroup(children: any): React.ReactElement {
        return _genericFormGroup<T>(this.props, children);
    }

    public getField() {
        const {options = [], size = "default"} = this.props;
        return () => {
            return (
                <select
                    onChange={(e) => (this.context as any).updateParentState(e, this.props.name)}
                    name={this.props.name}
                    className={AbstractField.mergeDefaultCssWithProps(this.getSelectCssName(this.props.size), this.props.className, (this.context as any).bare)}
                >
                    {options.map((optVal: string, i: number) => {
                        return <option value={optVal} key={i}>{optVal}</option>
                    })}
                </select>
            );
        }
    }

    private getSelectCssName(name: TypeSelectCssSizeName) {
        if(name === "default") {
            return "form-control"
        } else {
            return `form-control form-control-${name}`;
        }
    }
}
