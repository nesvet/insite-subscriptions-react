import {
	getSubscriptionSymbol,
	renewSymbol,
	subscribeSymbol,
	Subscription,
	SubscriptionArray,
	SubscriptionMap,
	SubscriptionObject,
	unsubscribeSymbol
} from "insite-subscriptions-client";
import { Component } from "react";


export class SubscriptionComponent extends Component {
	constructor(props) {
		super(props);
		
		const SubscriptionTarget =
			props.map ?
				SubscriptionMap :
				props.array ?
					SubscriptionArray :
					SubscriptionObject;
		
		const target = new SubscriptionTarget.WithSubscription(props.publication, props.params, () => this.handleUpdate(), false);
		
		this.value = target;
		
		if (props.map && props.Item)
			target.Item = props.Item;
		
		props.valueRef?.(this.value);
		
	}
	
	state =
		this.props.consistent ?
			undefined :
			{};
	
	publicationSnapshot =
		this.props.consistent ?
			undefined :
			JSON.stringify(this.props.params) + this.props.publication;
	
	get isActive() {
		return this.value[getSubscriptionSymbol]()?.isActive ?? false;
	}
	
	renew(publicationName, params) {
		return this.value[renewSymbol](publicationName, params);
	}
	
	subscribe() {
		return this.value[subscribeSymbol]();
	}
	
	unsubscribe() {
		return this.value[unsubscribeSymbol]();
	}
	
	
	shouldComponentUpdate = this.props.consistent ? undefined : nextProps => {
		const publicationSnapshot = JSON.stringify(nextProps.params) + nextProps.publication;
		
		if (this.publicationSnapshot === publicationSnapshot)
			return true;
		
		this.publicationSnapshot = publicationSnapshot;
		this.renew(nextProps.publication, nextProps.params);
		
		return false;
		
	};
	
	render() {
		return this.props.children?.(this.isActive, this.value) || null;
	}
	
	
	handleUpdate = () => this.props.onUpdate?.(this.value);
	
	componentDidMount() {
		
		this.subscribe();
		
		this.handleUpdate = this.props.consistent ? () => {
			
			this.props.onUpdate?.(this.value);
			this.forceUpdate();
			
		} : () => {
			
			this.props.onUpdate?.(this.value);
			this.setState({});
			
		};
		
	}
	
	componentWillUnmount() {
		
		this.unsubscribe();
		
	}
	
	
	static defaultProps = {
		params: []
	};
	
	static bindTo = Subscription.bindTo;
	
}
