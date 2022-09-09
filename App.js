  import type {Node} from 'react';
  import React, {useEffect, useRef, useState} from 'react';
  import {SafeAreaView, ScrollView, StyleSheet, View, Text, Pressable, Button} from 'react-native';
  import auth, {firebase} from '@react-native-firebase/auth';
  import firestore from '@react-native-firebase/firestore';
  import dayjs from 'dayjs';
  import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

  const App: () => Node = () => {
    const [test, setTest] = useState('Paris');
    let Customer;
    let Card;
    let Vocabulaire;
    const [listWW, setListWord] = useState(null); 

    const getRef = async (callback, parameters) => {
      Customer = await firestore().collection('Restaurant').doc('1000').collection('Customers');
      Card = await firestore().collection('Restaurant').doc('1000').collection('Card');
      Vocabulaire = await firestore().collection('anglais').doc('vocabulaires');
      // setListWord(callback( ...parameters));
    }
    //Creation
    const newCustomer = async ( telephone,name,cardId,customerId,lastVisite,) => {
      await Customer.doc(customerId).set({telephone, name, cardId, customerId, points: 0, remiseImmediat: 0, cagnotte: 0, visites: 1, lastVisite, historique: []});
    };
    const activateCard = async (cardId, customerId) => {
      await Card.doc(cardId).set({cardId, customerId, activatedAt: dayjs().format('DD/MM/YYYY')});
    };

    //Changements
    const changeCard = async ( cardId, customerId ) => {
      await Customer.doc(customerId).update({'cardId': cardId});
    }
    const changeCustomer = async ( cardId, customerId ) => {
      await Card.doc(CardId).update({'customerId': customerId});
    }
    //Bonus
    const addPoints = async (customerId, points ) => {
      await Customer.doc(customerId).update({'points': firebase.firestore.FieldValue.increment(points)});
    }
    const removePoints = async (customerId, points ) => {
      await Customer.doc(customerId).update({'points': firebase.firestore.FieldValue.increment(-1 * points)});
    }
    const addCagnottes = async (customerId, cagnottes ) => {
      await Customer.doc(customerId).update({'cagnotte': firebase.firestore.FieldValue.increment(cagnottes)});
    }
    const removeCagnottes = async (customerId, cagnottes ) => {
      await Customer.doc(customerId).update({'cagnotte': firebase.firestore.FieldValue.increment(-1 * cagnottes)});
    }
    const addRemiseImmediat = async (customerId, remiseImmediat ) => {
      await Customer.doc(customerId).update({'remiseImmediat': firebase.firestore.FieldValue.increment(remiseImmediat)});
    }
    const removeRemiseImmediat = async (customerId, remiseImmediat ) => {
      await Customer.doc(customerId).update({'remiseImmediat': firebase.firestore.FieldValue.increment(-1 * remiseImmediat)});
    }
    //Historiques
    const addHistory = async (customerId, history) => {
      let oldHistory = await Customer.doc(customerId).get()
      //Ne sauvegarde que les dix derniers sauvegardes.
      let newHistory = [ ...oldHistory._data.history, history].reverse().splice(0,10);
      Customer.doc(customerId).update('history', newHistory);
    }


    const addWord = async (english, french, chinese) => {
      Vocabulaire = await firestore().collection('anglais').doc('Vocabulaire').collection(`${dayjs().year()}`);
      try{
        await Vocabulaire.doc(`${dayjs().month() + 1}`).update({listWord: firebase.firestore.FieldValue.arrayUnion({en: english, fr: french, ch:chinese, date: dayjs().date()})});
      } catch (e) {
      await Vocabulaire.doc(`${dayjs().month() + 1}`).set({});
      await Vocabulaire.doc(`${dayjs().month() + 1}`).update({listWord: firebase.firestore.FieldValue.arrayUnion({en: english, fr: french, ch:chinese, date: dayjs().date()})});
      }
    }
    const todayWord = async () => {
      Vocabulaire = await firestore().collection('anglais').doc('Vocabulaire').collection(`${dayjs().year()}`).doc(`${dayjs().month() + 1}`);
      const data = await Vocabulaire.get();
      let listWord =  data._data.listWord;
      console.log(listWord);
      listWord =  listWord.filter((e) => e.date === dayjs().date());
      setListWord(listWord);
    }
    const randomWord = async () => {
      Vocabulaire = await firestore().collection('anglais').doc('Vocabulaire').collection(`${dayjs().year()}`).doc(`${dayjs().month() + 1}`);
      const data = await Vocabulaire.get();
      let listWord = data._data.listWord;
      listWord = listWord.sort(() => Math.random() - 0.5).splice(0,5);
      setListWord(listWord);
    }

    const viewStory = async (day) => {
      Vocabulaire = await firestore().collection('anglais').doc('Vocabulaire').collection(`${day.year}`).doc(`${day.month}`);
      listWord = await Vocabulaire.get();
      listWord = listWord._data.listWord.filter((e)=> e.date === day.day);
      if (listWord !== []){ 
        setListWord(listWord);
      } 
    }
    return (
      <SafeAreaView>
          <ScrollView>
              <Calendar
                initialDate={'2022-09-09'}
                onDayPress={day => {
                  viewStory(day);
                }}
              />
              <View style={[styles.buttons, {borderBottomWidth: 2, paddingBottom: 10}]}>
                <Button 
                  onPress={todayWord}
                  title= 'Today word'
                />
                <Button 
                  onPress={randomWord}
                  title= 'Random word'
                />
              </View>
              <View style={{display: 'flex', flexDirection:'row',flexWrap: 'wrap', justifyContent: 'center'}}>            
              {
                listWW === null ? 
                <Text>Non word to display</Text>:
                listWW.map((element) => <WordDisplay element={element} />
                )
              }
              </View>
          </ScrollView>
      </SafeAreaView>
    );
  };

  const WordDisplay = (props) => {
    return (
      <View style ={{ margin: '2%', height: 100, display: 'flex',  flexDirection:'column', justifyContent: 'space-around',
                    borderWidth: 2, padding: 5, borderRadius: 10,   
      }}>
        <Text>  🇺🇸 :{props.element.en}</Text>
        <Text>  🇫🇷 : {props.element.fr}</Text>
        <Text>  🇨🇳 :{props.element.ch}</Text>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    buttons: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',

      justifyContent:'space-around',
      width: '100%',
      height: 50,

      marginTop:'5%',

      // backgroundColor: 'black',
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
    },
    highlight: {
      fontWeight: '700',
    },
  });

  export default App;
