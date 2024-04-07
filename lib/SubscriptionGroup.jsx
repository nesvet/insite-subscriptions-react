import { noop } from "@nesvet/n";
import { Subscription, SubscriptionGroup } from "insite-subscriptions-client";
import { Component } from "react";


export class SubscriptionGroupComponent extends Component {
	constructor(props) {
		super(props);
		
		this.group = new SubscriptionGroup(props.definitions, {
			target: props.target,
			debounce: props.debounce,
			immediately: false
		});
		
		this.group.on("update", () => this.handleUpdate());
		
		props.valuesRef?.(this.group.values);
		
	}
	
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
	
	redefine = definitions => this.group.redefine(definitions);
	
	subscribe = () => this.group.subscribe();
	
	unsubscribe = () => this.group.unsubscribe();
	
	shouldComponentUpdate = this.props.consistent ? undefined : nextProps => {
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
