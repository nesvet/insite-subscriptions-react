import { Component, type ReactNode } from "react";
import {
	getSubscriptionSymbol,
	renewSymbol,
	subscribeSymbol,
	Subscription,
	SubscriptionArray,
	SubscriptionArrayWithSubscription,
	SubscriptionMap,
	SubscriptionMapWithSubscription,
	SubscriptionObject,
	SubscriptionObjectWithSubscription,
	unsubscribeSymbol
} from "insite-subscriptions-client";


type Value = SubscriptionArrayWithSubscription | SubscriptionMapWithSubscription | SubscriptionObjectWithSubscription;

type Props = {
	map?: boolean;
	array?: boolean;
	publication: string;
	params: unknown[];
	Item?: SubscriptionMap["Item"];
	valueRef: (value: Value) => void;
	consistent?: boolean;
	children?: (isActive: boolean, value: Value) => ReactNode;
	onUpdate?: (value: Value) => void;
};

type State = {} | undefined;// eslint-disable-line @typescript-eslint/ban-types

function isValueSubscriptionMap(props: Props, value: Value): value is SubscriptionMapWithSubscription {
	return props.map === true;
}


export class SubscriptionComponent extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		
		const SubscriptionTarget =
			props.map ?
				SubscriptionMap :
				props.array ?
					SubscriptionArray :
					SubscriptionObject;
		
		const target = new SubscriptionTarget.WithSubscription(props.publication, props.params, () => this.handleUpdate(), false);
		
		this.value = target;
		
		if (isValueSubscriptionMap(props, target) && props.Item)
			target.Item = props.Item;
		
		props.valueRef?.(this.value);
		
	}
	
	state =
		this.props.consistent ?
			undefined :
			{};
	
	value;
	
	publicationSnapshot =
		this.props.consistent ?
			undefined :
			JSON.stringify(this.props.params) + this.props.publication;
	
	get isActive() {
		return this.value[getSubscriptionSymbol]()?.isActive ?? false;
	}
	
	renew(publicationName: string, params: unknown[]) {
		return this.value[renewSymbol](publicationName, params);
	}
	
	subscribe() {
		return this.value[subscribeSymbol]();
	}
	
	unsubscribe() {
		return this.value[unsubscribeSymbol]();
	}
	
	
	shouldComponentUpdate = this.props.consistent ? undefined : (nextProps: Props) => {
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
