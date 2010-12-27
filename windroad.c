/* Written by Kusigrosz in September 2010 (parts much earlier)
 * This program is in public domain, with all its bugs etc.
 * No warranty whatsoever.
 *
 * Generating winding roads/corridors for a roguelike game.
 *
 * The functions that do road generating are:
 *
 * uti_windroad(&road, mpc, x1, y1, x2, y2, pertamt)
 *     Generates a winding road from x1, y1 to x2, y2 without
 *     sharp turns. The road winds regardless of the relative location
 *     of endpoints (unless it is too short). The parameter pertamt
 *     controls the degree of perturbation the initially straight road
 *     is subjected to; typical values of 5-50 give decent results.
 *     mpc is the pointer to the map structure (needed to make sure
 *     the winding road stays within the map.
 * 
 * uti_zigzag(&road, x1, y1, x2, y2, turnpct, diagpct)
 *     Generates a randomly zigzagging road from x1, y1 to x2, y2
 *     The road zigzags only if the endpoints differ in both coordinates,
 *     Otherwise it is a straight line. The parameter turnpct is the
 *     chance of a non-forced turn in percent (so, 100/turnpct is 
 *     approximately the length of a straight segment; diagpct is 
 *     the chance that a diagonal turn is allowed.
 * 
 * uti_sigsag(&road, x1, y1, x2, y2, turnpct, diagpct)
 *     The same as zigzag, but without sharp corners.
 */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define TRN_XSIZE 78
#define TRN_YSIZE 23

#define SQR(x)  ((x) * (x))

#define MAX_SEQ 1024

#define FLOOR   '.'
#define WALL    '#'

#define RQR(p) {if (!(p)) \
    {fprintf(stderr, "requirement failed: line %d\n", __LINE__); \
    exit(EXIT_FAILURE);}}

struct mappiece
    {
    char** map;
    int xsize;
    int ysize;
    };

struct seqcells
    {
    int x[MAX_SEQ];
    int y[MAX_SEQ];
    int length;
    };

/* Declarations of all functions */
struct mappiece* uti_makempc(int xsize, int ysize);
int rnd_i0(int n);
int rnd_ic(int p, int n);
int uti_sign(int n);
int uti_nsteps(int x1, int y1, int x2, int y2);
int uti_inbord(const struct mappiece* mpc, int x, int y);
void uti_rline(struct seqcells* ret, int x1, int y1, int x2, int y2);
void uti_uline(struct seqcells* ret, int x1, int y1, int x2, int y2);
void uti_zigzag(struct seqcells* ret, int x1, int y1, int x2, int y2,
    int turnpct, int diagpct);
void uti_sigsag(struct seqcells* ret, int x1, int y1, int x2, int y2,
    int turnpct, int diagpct);
static int uti_signcos2(int x0, int y0, int x1, int y1, int x2, int y2);
static int uti_perturb(struct seqcells* way, const struct mappiece* mpc, 
    int mindist, int maxdist, int pertamt);
static int uti_connwaypts(struct seqcells* result,
    const struct seqcells* waypts);
static void uti_cutcorners(struct seqcells* seq);
int uti_windroad(struct seqcells* road, const struct mappiece* mpc, 
    int x1, int y1, int x2, int y2, int pertamt);
void putroad(struct mappiece* mpc, const struct seqcells* road);
int main(int argc, char* argv[]);

/* Globals: */
int Xoff[8] = {1,  1,  0, -1, -1, -1,  0,  1};
int Yoff[8] = {0,  1,  1,  1,  0, -1, -1, -1};

struct mappiece* uti_makempc(int xsize, int ysize)
    {
    int x;
    struct mappiece* mpc = NULL;
    
    RQR((xsize > 0) && (ysize > 0));
    
    mpc = malloc(sizeof(struct mappiece));
    RQR(mpc);
    mpc->map = malloc(xsize * sizeof(char*));
    RQR(mpc->map);
    for (x = 0; x < xsize; x++)
        {
        mpc->map[x] = malloc(ysize * sizeof(char));
        RQR(mpc->map[x]);
        }
    mpc->xsize = xsize;
    mpc->ysize = ysize;
    return (mpc);
    }

int rnd_i0(int n) /* 0 <= rnd_i0(n) < n */
    {
    RQR(n > 0);
    return ((int)(rand() % n));
    }

int rnd_ic(int p, int n) /* Chance p out of n. Must return 0 or 1 */
    {
    return ( !! ((int)(rand() % n) < p) );
    }

int uti_sign(int n)
    {
    if (n > 0)
        {
        return (1);
        }
    else if (n == 0)
        {
        return (0);
        }
    else
        {
        return (-1);
        }
    }

int uti_nsteps(int x1, int y1, int x2, int y2)
    {
    int dx, dy;

    dx = abs(x1 - x2);
    dy = abs(y1 - y2);
    
    return ((dx > dy) ? dx : dy);
    }

/* Is the location within the borders - with 1 cell margin
 */
int uti_inbord(const struct mappiece* mpc, int x, int y)
    {
    if ((x < 1) || (x >= mpc->xsize - 1) || 
        (y < 1) || (y >= mpc->ysize - 1))
        {
        return (0);
        }
    return (1);
    }

/* The Bresenham line algorithm. Not symmetrical.
 */
void uti_rline(struct seqcells* ret, int x1, int y1, int x2, int y2)
    {
    int xstep, ystep;
    int xc, yc;
    int acc;
    int cnt = 0;
    
    /* "thin" line, so this check should be enough */
    RQR((abs(x2 - x1) < MAX_SEQ) && (abs(y2 - y1) < MAX_SEQ));
    RQR(ret);

    xstep = uti_sign(x2 - x1);
    ystep = uti_sign(y2 - y1);

    xc = x1;
    yc = y1;

    ret->x[cnt] = xc;
    ret->y[cnt] = yc;
    cnt++;

    if ((x1 == x2) && (y1 == y2))
        {
        ret->length = cnt;
        return;
        }

    if (abs(x2 - x1) >= abs(y2 - y1))
        {
        acc = abs(x2 - x1);
        do  
            {
            xc += xstep;
            acc += 2 * abs(y2 - y1);
            
            if (acc >= 2 * abs(x2 - x1))
                {
                acc -= 2 * abs(x2 - x1);
                yc += ystep;
                }
            ret->x[cnt] = xc;
            ret->y[cnt] = yc;
            cnt++;
            } while ((xc != x2) && (cnt < MAX_SEQ));
        }
    else
        {
        acc = abs(y2 - y1);
        do  
            {
            yc += ystep;
            acc += 2 * abs(x2 - x1);
            
            if (acc >= 2 * abs(y2 - y1))
                {
                acc -= 2 * abs(y2 - y1);
                xc += xstep;
                }
            ret->x[cnt] = xc;
            ret->y[cnt] = yc;
            cnt++;
            } while ((yc != y2) && (cnt < MAX_SEQ));
        }

    ret->length = cnt;
    }

/* Symmetrized Bresenham line algorithm.
 * This line is symmetrical w/r swapping the ends, but can be
 * "thick" in some places (a cell may have more than 2 neigbours). 
 * NOTE: No check for level bounds here!  
 * NOTE: a "thick" line requires more cells than abs(x2-x1) or
 * abs(y2-y1); hence the check was moved to the end.
 */
void uti_uline(struct seqcells* ret, int x1, int y1, int x2, int y2)
    {
    int xstep, ystep;
    int xc, yc;
    int acc;
    int abdx, abdy;
    int cnt = 0;

    RQR(ret);

    xstep = uti_sign(x2 - x1);
    ystep = uti_sign(y2 - y1);
    abdx = abs(x2 - x1);
    abdy = abs(y2 - y1);

    xc = x1;
    yc = y1;

    ret->x[cnt] = xc;
    ret->y[cnt] = yc;
    cnt++;
    if ((x1 == x2) && (y1 == y2))
        {
        ret->length = cnt;
        return;
        }

    if (abdx >= abdy)
        {
        acc = abdx;
        do  
            {
            xc += xstep;
            acc += 2 * abdy;
            
            if (acc >= 2 * abdx)
                {
                if (acc == 2 * abdx)
                    {
                    ret->x[cnt] = xc;
                    ret->y[cnt] = yc;
                    cnt++;
                    }
                acc -= 2 * abdx;
                yc += ystep;
                }
            ret->x[cnt] = xc;
            ret->y[cnt] = yc;
            cnt++;
            } while ((xc != x2) && (cnt < MAX_SEQ - 1)); /* two ++ above */
        }
    else
        {
        acc = abdy;
        do  
            {
            yc += ystep;
            acc += 2 * abdx;
            
            if (acc >= 2 * abdy)
                {
                if (acc == 2 * abdy)
                    {
                    ret->x[cnt] = xc;
                    ret->y[cnt] = yc;
                    cnt++;
                    }
                acc -= 2 * abdy;
                xc += xstep;
                }
            ret->x[cnt] = xc;
            ret->y[cnt] = yc;
            cnt++;
            } while ((yc != y2) && (cnt < MAX_SEQ - 1)); /* two ++ above */
        }

    RQR(cnt < MAX_SEQ); /* line too long */

    ret->length = cnt;
    }

/* A randomized zigzag from x1, y1 to x2, y2.
 * The zigzag stays within the rectangle spanned by the ends.
 * turnpct is the percent chance of a (non-forced) turn
 * (so 100/turnpct is the average length of a straight section)
 * and diagpct is the chance of diagonal move.
 */
void uti_zigzag(struct seqcells* ret, int x1, int y1, int x2, int y2,
    int turnpct, int diagpct)
    {
    int xc, yc;
    int cnt = 0;
    int deltax = 0, deltay = 0; /* will be overwritten anyway. */
    int xremain, yremain; /* the x, y steps left to go */
    
    RQR(ret);
    RQR((diagpct >= 0) && (diagpct <= 100));
    RQR((turnpct >= 0) && (turnpct <= 100));
    
    xc = x1;
    yc = y1;

    ret->x[0] = xc;
    ret->y[0] = yc;
    cnt++;

    while ( (cnt < MAX_SEQ) && ((xc != x2) || (yc != y2)) )
        {
        xremain = abs(x2 - xc);
        yremain = abs(y2 - yc);
        
        /* first step, random turn, or forced turn: new values for deltas */
        if ( (cnt == 1) || rnd_ic(turnpct, 100) || 
            (abs(x2 - (xc + deltax)) > xremain) || 
            (abs(y2 - (yc + deltay)) > yremain) ||
            ((xremain == yremain) && rnd_ic(diagpct, 100)) )
            {
            deltax = uti_sign(x2 - xc);
            deltay = uti_sign(y2 - yc);
            
            if (rnd_ic(diagpct, 100))
                { /* diags OK */
                if (xremain > yremain) 
                    { /* so deltax is nonzero */
                    if (rnd_ic(xremain - yremain, xremain))
                        {
                        deltay = 0;
                        }
                    }
                else if (xremain < yremain) 
                    { /* so deltay is nonzero */
                    if (rnd_ic(yremain - xremain, yremain))
                        {
                        deltax = 0;
                        }
                    }
                /* else they are equal and nonzero - deltas stay */
                }
            else 
                { /* no diags */
                if (rnd_ic(xremain, xremain + yremain))
                    {
                    if (deltax)
                        {
                        deltay = 0;
                        }
                    }
                else
                    {
                    if (deltay)
                        {
                        deltax = 0;
                        }
                    }
                }
            }

        xc += deltax;
        yc += deltay;

        ret->x[cnt] = xc;
        ret->y[cnt] = yc;
        cnt++;
        }

    RQR(cnt < MAX_SEQ); /* line too long */

    ret->length = cnt;
    }

/* Like zigzag, but with no straight turns. Just make a zigzag and
 * cut corners.
 */
void uti_sigsag(struct seqcells* ret, int x1, int y1, int x2, int y2,
    int turnpct, int diagpct)
    {
    uti_zigzag(ret, x1, y1, x2, y2, turnpct, diagpct);
    uti_cutcorners(ret);
    }

/* The square of the cosine of the angle between vectors p0p1 and p1p2,
 * with the sign of the cosine, in permil (1.0 = 1000).
 */
static int uti_signcos2(int x0, int y0, int x1, int y1, int x2, int y2)
    {
    int sqlen01, sqlen12, prod, val;
    
    sqlen01 = SQR(x1 - x0) + SQR(y1 - y0);
    sqlen12 = SQR(x2 - x1) + SQR(y2 - y1);
    RQR(sqlen01 && sqlen12);

    prod = (x1 - x0) * (x2 - x1) + (y1 - y0) * (y2 - y1);
    val = 1000 * (prod * prod / sqlen01) / sqlen12; /* Overflow? */
    if (prod < 0)
        {
        val = -val;
        }

    return (val);
    }

/* Select random points in the provided trajectory and displace them
 * provided no sharp angles are created, and the new location isn't
 * too close or too far from the neighbours.
 */
static int uti_perturb(struct seqcells* way, const struct mappiece* mpc, 
    int mindist, int maxdist, int pertamt)
    {
    int i;
    int nx, ny;
    int lox, loy, hix, hiy;
    int lod2, hid2;
    int ri, rdir;
    int mind2, maxd2;
    const int mincos2 = 500; /* cos^2 in 1/1000, for angles < 45 degrees */

    RQR(way && mpc);
    RQR((mindist > 0) && (maxdist > mindist));
    
    if (way->length < 3)
        { /* nothing to do */
        return (0);
        }

    mind2 = SQR(mindist);
    maxd2 = SQR(maxdist);
    for (i = 0; i < pertamt * way->length; i++)
        {
        ri = 1 + rnd_i0(way->length - 2);
        rdir = rnd_i0(8);
        nx = way->x[ri] + Xoff[rdir];
        ny = way->y[ri] + Yoff[rdir];
        lox = way->x[ri - 1];
        loy = way->y[ri - 1];
        hix = way->x[ri + 1];
        hiy = way->y[ri + 1];
        lod2 = SQR(nx - lox) + SQR(ny - loy);
        hid2 = SQR(nx - hix) + SQR(ny - hiy);
        
        if ((0 == uti_inbord(mpc, nx, ny)) ||
            (lod2 < mind2) || (lod2 > maxd2) ||
            (hid2 < mind2) || (hid2 > maxd2))
            {
            continue;
            }
        /* Check the angle at ri (vertex at nx, ny) */
        if (uti_signcos2(lox, loy, nx, ny, hix, hiy) < mincos2)
            {
            continue;
            }
        /* Check the angle at ri - 1 (vertex at lox, loy) */
        if ( (ri > 1) && (uti_signcos2(way->x[ri - 2], way->y[ri - 2], 
            lox, loy, nx, ny) < mincos2) )
            {
            continue;
            }
        /* Check the angle at ri + 1 (vertex at hix, hiy) */
        if ( (ri < way->length - 2) && (uti_signcos2(nx, ny, hix, hiy,
            way->x[ri + 2], way->y[ri + 2]) < mincos2) )
            {
            continue;
            }
        way->x[ri] = nx;
        way->y[ri] = ny;
        }
    return (1);
    }

/* Connect the waypoints in way with straight lines, putting the result
 * in the returned structure.
 */
static int uti_connwaypts(struct seqcells* result, 
    const struct seqcells* waypts)
    {
    int i, j, k;
    struct seqcells segment;
    
    RQR(result);
    RQR(waypts && (waypts->length > 1));

    result->x[0] = waypts->x[0];
    result->y[0] = waypts->y[0];
    k = 1;
    for (i = 0; i < waypts->length - 1; i++)
        {
        uti_rline(&segment, waypts->x[i], waypts->y[i], 
            waypts->x[i + 1], waypts->y[i + 1]);
        for (j = 1; (j < segment.length) && (k < MAX_SEQ); j++)
            {
            result->x[k] = segment.x[j];
            result->y[k] = segment.y[j];
            k++;
            }
        }
    result->length = k;
    return (k < MAX_SEQ);
    }

static void uti_cutcorners(struct seqcells* seq)
    {
    int i, j;

    RQR(seq);

    j = 1;
    for (i = 1; i < seq->length - 1; i++) /* all points except the ends */
        {
        seq->x[j] = seq->x[i];
        seq->y[j] = seq->y[i];

        if (uti_nsteps(seq->x[j - 1], seq->y[j - 1], 
            seq->x[i + 1], seq->y[i + 1]) > 1)
            {
            j++;
            }
        }

    seq->x[j] = seq->x[i];
    seq->y[j] = seq->y[i];
    j++;

    seq->length = j;
    }

/* Generate a road from x1, y1 to x2, y2.
 */
int uti_windroad(struct seqcells* road, const struct mappiece* mpc, 
    int x1, int y1, int x2, int y2, int pertamt)
    {
    int i, j;
    struct seqcells waypts;
    int ret;

    RQR(mpc);
    RQR(uti_inbord(mpc, x1, y1) && uti_inbord(mpc, x2, y2));

    uti_rline(&waypts, x1, y1, x2, y2);
    if (waypts.length < 5)
        { /* Too short to wind, just copy the straight line */
        *road = waypts;
        return (1);
        }

    /* Copy one cell in two/three, making sure the ends are copied */
    j = 0;
    for (i = 0; i < waypts.length; )
        {
        waypts.x[j] = waypts.x[i];
        waypts.y[j] = waypts.y[i];
        j++;
        if ((i < waypts.length - 5) || (i >= waypts.length - 1))
            {
            i += 2 + rnd_i0(2);
            }
        else if (i == waypts.length - 5)
            {
            i += 2;
            }
        else
            {
            i = waypts.length - 1;
            }
        }
    waypts.length = j;

    uti_perturb(&waypts, mpc, 2, 5, pertamt); /* waypoint dist min, max */
    ret = uti_connwaypts(road, &waypts);
    uti_cutcorners(road); /* Connecting may sometimes make 'L' corners */
    return (ret);
    }

/* put the road on the map 
 */
void putroad(struct mappiece* mpc, const struct seqcells* road)
    {
    int i, cx, cy;
    
    RQR(mpc && road);

    for (i = 0; i < road->length; i++)
        {
        cx = road->x[i];
        cy = road->y[i];
        if (uti_inbord(mpc, cx, cy))
            {
            mpc->map[cx][cy] = FLOOR;
            }
        }
    }

int main(int argc, char* argv[])
    {
    struct mappiece* mpc;
    struct seqcells road;
    int i;
    int x, y;
    int x1, y1, x2, y2;
    int pertamt = 10; /* default perturbation amount */

    mpc = uti_makempc(TRN_XSIZE, TRN_YSIZE);

    srand((unsigned int)time(NULL));

    for (x = 0; x < mpc->xsize; x++)
        {
        for (y = 0; y < mpc->ysize; y++)
            {
            mpc->map[x][y] = WALL;
            }
        }

    if (argc > 1)
        {
        pertamt = atoi(argv[1]);
        }

    /* For profiling: N roads */
    for (i = 0; i < 1; i++)
        {
        x1 = 1 + rnd_i0(TRN_XSIZE - 2);
        y1 = 1 + rnd_i0(TRN_YSIZE - 2);
        x2 = 1 + rnd_i0(TRN_XSIZE - 2);
        y2 = 1 + rnd_i0(TRN_YSIZE - 2);
        uti_windroad(&road, mpc, x1, y1, x2, y2, pertamt);
     /* uti_zigzag(&road, x1, y1, x2, y2, 30, 0); *//* 30% turns, 0% diags */
     /* uti_sigsag(&road, x1, y1, x2, y2, 30, 0); */
        }

    putroad(mpc, &road);

    printf("from %d %d to %d %d\n", x1, y1, x2, y2);
    for (y = 0; y < mpc->ysize; y++)
        {
        for (x = 0; x < mpc->xsize; x++)
            {
            printf("%c", mpc->map[x][y]);
            }
        printf("\n");
        }
    exit(EXIT_SUCCESS);
    }
