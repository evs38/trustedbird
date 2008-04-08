//				Package : threadtests
// diner.cc			Created : 23/1/95 sll
//
// Copyright (C) AT&T Laboratories Cambridge 1994, 1995
//
// Description:
//     A solution to the infamous dining philosophers, implemented using
//     the omnithread package.
//     This program exercises the thread creation and destruction,
//     mutexes and condition variables.
//
//     Expected to see all the philosophers doing various things. None
//     of them is absent.
//       
//

/*
 $Log: diner.cc,v $
 Revision 1.7.2.4  2006/01/19 16:44:28  dgrisby
 Merge from omni4_0_develop.

 Revision 1.7.2.3  2005/06/08 09:35:33  dgrisby
 Update examples / utils for cleanliness and use of new C++ mapping.

 Revision 1.7.2.2  2005/01/06 23:09:40  dgrisby
 Big merge from omni4_0_develop.

 Revision 1.7.2.1  2003/03/23 21:02:55  dgrisby
 Start of omniORB 4.1.x development branch.

 Revision 1.6  1999/03/11 16:26:15  djr
 Updated copyright notice

 Revision 1.5  1997/12/09 20:21:58  sll
 Replaced macro __NT__ with __WIN32__

// Revision 1.4  1997/06/03  10:59:49  tjr
// new omnithread interface using exceptions and lock class for mutex & sem.
//
// Revision 1.3  1995/08/17  10:22:27  tjr
// new thread stuff
//
// Revision 1.2  1995/03/13  16:26:44  sll
// Added mutex around output to STDERR stream.
//
// Revision 1.1  1995/01/25  11:54:48  sll
// Initial revision
//
 */

#include <omniORB4/CORBA_sysdep.h> // for HAVE_STD

#ifdef HAVE_STD
#  include <iostream>
   using namespace std;
#else
#  include <iostream.h>
#endif
#include <stdlib.h>
#include <omnithread.h>

#ifdef __WIN32__
static int last_rand = 0;
#endif

static omni_mutex rand_mutex;

static int random_l()
{
    rand_mutex.lock();
    int i = rand();
#ifdef __WIN32__
    last_rand = i;
#endif
    rand_mutex.unlock();
    return i;
}

static omni_mutex print_mutex;
#define PRINTMSG(x) do { print_mutex.lock(); x; print_mutex.unlock(); } while (0)



#define N_DINERS 5	// n philosophers sharing n chopsticks

static omni_mutex chopsticks[N_DINERS];

// At most n philosophers are allowed into the room, others would
// have to wait at the door. This restriction demonstrates the use
// of condition variables.

static omni_mutex     room_mutex;	// protects room_occupancy & phillies

static omni_condition room_cond(&room_mutex);
static int            room_occupancy = 0;

static class philosopher* phillies[N_DINERS];


             
class philosopher : public omni_thread {

    void run(void* arg) {
	int id = *(int*)arg;
	delete (int*)arg;

#ifdef __WIN32__
	rand_mutex.lock();
	srand(last_rand);
	rand_mutex.unlock();
#endif

	int l = id;
	int r = l+1;
	if (r == N_DINERS)
	    r = 0;
	if (l & 1)
	{
	    int t = l;
	    l = r;
	    r = t;
	}

	PRINTMSG(cout << "Philosopher #" << id << " has entered the room." << endl);

	int count = random_l() % 10 + 1;
	while (count--)
	{
	    chopsticks[l].lock();
	    chopsticks[r].lock();
	    PRINTMSG(cout << "Philosopher #" << id << " is eating spaghetti now." << endl);
	    omni_thread::sleep(random_l()%2,random_l()%1000000000);
	    chopsticks[l].unlock();
	    chopsticks[r].unlock();
	    PRINTMSG(cout << "Philosopher #" << id << " is pondering about life." << endl);
	    omni_thread::sleep(random_l()%2,random_l()%1000000000);
	}

	room_mutex.lock();
	room_occupancy--;
	phillies[id] = NULL;
	room_mutex.unlock();
	room_cond.signal();
	PRINTMSG(cout << "Philosopher #" << id << " has left the room (" << room_occupancy << " left)." << endl);
    }

    // the destructor of a class that inherits from omni_thread should never be
    // public (otherwise the thread object can be destroyed while the
    // underlying thread is still running).

    ~philosopher() {}

    void* make_arg(int i) { return (void*)new int(i); }

public:

    philosopher(int id) : omni_thread(make_arg(id)) {
	start();
    }
};

int
main(int argc, char ** argv)
{
    int i;

    room_mutex.lock();
    for (i=0; i<N_DINERS; i++) {
	phillies[i] = new philosopher(i);
    }

    room_occupancy = N_DINERS;

    while (1) {
	while (room_occupancy == N_DINERS) {
	    PRINTMSG(cout << "main thread about to block " << room_occupancy << endl);
	    room_cond.wait();
	}

	// Hm.. someone has left the room.

	room_mutex.unlock();

	// Sleep for a while and then create a new philosopher

        PRINTMSG(cout << "main thread sleep" << endl);
	omni_thread::sleep(1,200000000);
        PRINTMSG(cout << "main thread wake up" << endl);

	room_mutex.lock();
	for (i=0; i<N_DINERS; i++)
	    if (phillies[i] == NULL)
		break;
	if (i == N_DINERS) {
	    PRINTMSG(cout << "Contrary to what I was told, no one has left the room!!!!\n");
	    PRINTMSG(cout << "I give up!!!" << endl);
	    exit(1);
	}
	phillies[i] = new philosopher(i);
	room_occupancy++;
    }
    return(0);
}
