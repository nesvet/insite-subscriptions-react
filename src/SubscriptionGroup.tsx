import { Component, ReactNode } from "react";
import { noop } from "@nesvet/n";
import {
	Subscription,
	SubscriptionGroup,
	type Options as SubscriptionGroupOptions,
	type SubscriptionGroupUnparsedDefinition,
	type SubscriptionGroupValues
} from "insite-subscriptions-client";


type Props = {
	definitions: SubscriptionGroupUnparsedDefinition[];
	target: SubscriptionGroupOptions["target"];
	debounce: SubscriptionGroupOptions["debounce"];
	valuesRef: (values: SubscriptionGroupValues) => void;
	consistent: boolean;
	children: (isLoaded: boolean, values: SubscriptionGroupValues) => ReactNode;
	onUpdate: (group: SubscriptionGroup) => void;
};

type State = {} | undefined;// eslint-disable-line @typescript-eslint/ban-types


export class SubscriptionGroupComponent extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		
		this.group = new SubscriptionGroup(props.definitions, {
			target: props.target,
			debounce: props.debounce,
			immediately: false
		});
		
		this.group.on("update", () => this.handleUpdate());
		
		props.valuesRef?.(this.group.values);
		
	}
	
	group;
	
	state = this.props.consistent ? undefined : {};
	
	definitionsSnapshot = this.props.consistent ? undefined : JSON.stringify(this.props.definitions);
	
	get isLoaded() {
		return this.group.isLoaded;
	}
	
	get isInited() {
		return this.group.isInited;
	}
	
	get values() {
		return this.group.values;
	}
	
	redefine = (definitions: SubscriptionGroupUnparsedDefinition[]) => this.group.redefine(definitions);
	
	subscribe = () => this.group.subscribe();
	
	unsubscribe = () => this.group.unsubscribe();
	
	shouldComponentUpdate = this.props.consistent ? undefined : (nextProps: Props) => {
		if (this.props.target !== nextProps.target || this.props.debounce !== nextProps.debounce)
			this.group.applyOptions({ target: nextProps.target, debounceLimit: nextProps.debounce });
		
		const definitionsSnapshot = JSON.stringify(nextProps.definitions);
		
		if (this.definitionsSnapshot === definitionsSnapshot)
			return true;
		
		this.definitionsSnapshot = definitionsSnapshot;
		this.redefine(nextProps.definitions);
		
		return false;
		
	};
	
	render() {
		return this.props.children?.(this.group.isLoaded, this.group.values) || null;
	}
	
	
	handleUpdate = () => this.props.onUpdate?.(this.group);
	
	componentDidMount() {
		
		this.subscribe();
		
		this.handleUpdate = this.props.consistent ? () => {
			
			this.props.onUpdate?.(this.group);
			this.forceUpdate();
			
		} : () => {
			
			this.props.onUpdate?.(this.group);
			this.setState({});
			
		};
		
	}
	
	componentWillUnmount() {
		
		this.handleUpdate = noop;
		
		this.unsubscribe();
		
	}
	
	
	static bindTo = Subscription.bindTo;
	
}
